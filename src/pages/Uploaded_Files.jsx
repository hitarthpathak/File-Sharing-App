import { db_instance, storage_instance } from "../firebase/Firebase_Config";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import useAuth from "../custom_hook/useAuth";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import File_Uploading_Portal from "../portals/File_Uploading_Portal";
import File_Sharing_Portal from "../portals/File_Sharing_Portal";
import Edit_Icon from "/Edit-Icon.png";
import Un_Favourite_Icon from "/Un-Favourite-Icon.png";
import Favourite_Icon from "/Favourite-Icon.png";
import Update_Icon from "/Update-Icon.png";
import Cancel_Icon from "/Cancel-Icon.png";
import Share_Icon from "/Share-Icon.png";
import Download_Icon from "/Download-Icon.png";
import Delete_Icon from "/Delete-Icon.png";

function Uploaded_Files() {

    const { user, loading } = useAuth();
    const current_user_id = user?.uid;
    const current_user_email = user?.email;

    const [is_file_uploading_portal_open, set_is_file_uploading_portal_open] = useState(false);
    const [is_file_sharing_portal_open, set_is_file_sharing_portal_open] = useState(false);
    const [uploaded_files_list, set_uploaded_files_list] = useState([]);
    const [active_file_id, set_active_file_id] = useState(null);
    const [editing_file_name, set_editing_file_name] = useState(false);
    const [input_rename_value, set_input_rename_value] = useState("");
    const [selected_file_to_share, set_selected_file_to_share] = useState(null);

    useEffect(() => {
        if (current_user_id) {
            fetch_uploaded_files();
        } else {
            set_uploaded_files_list([]);
        };
    }, [current_user_id]);

    async function fetch_uploaded_files() {
        if (!current_user_id) return;

        try {
            let files_query = query(collection(db_instance, "user_files"), where("owner_id", "==", current_user_id), where("type", "==", "file"));
            let query_snapshot = await getDocs(files_query);
            let files_collection = [];

            query_snapshot.forEach((document) => {
                files_collection.push({ id: document.id, ...document.data() });
            });

            set_uploaded_files_list(files_collection);
        } catch (error) {
            console.error("Error Fetching Uploaded File : ", error);
        };
    };

    function render_file_list_preview(file) {
        const file_mime_type = file.file_type || "";

        switch (true) {
            case file_mime_type.startsWith("image/"):
                return <img className="h-[2.5rem] w-[2.5rem] object-cover rounded-md border shadow-xs shrink-0" src={file.download_url} alt="Preview" />;

            case file_mime_type.startsWith("video/"):
                return <div className="h-[2.5rem] w-[2.5rem] bg-purple-100 border border-purple-200 rounded-md flex items-center justify-center font-bold text-purple-600 text-[9px] shadow-xs shrink-0">VIDEO</div>;

            case file_mime_type === "application/pdf":
                return <div className="h-[2.5rem] w-[2.5rem] bg-red-100 border border-red-200 rounded-md flex items-center justify-center font-bold text-red-600 text-[10px] shadow-xs shrink-0">PDF</div>;

            case file_mime_type.includes("word") || file_mime_type.includes("officedocument"):
                return <div className="h-[2.5rem] w-[2.5rem] bg-blue-100 border border-blue-200 rounded-md flex items-center justify-center font-bold text-blue-600 text-[10px] shadow-xs shrink-0">DOC</div>;

            case file_mime_type.startsWith("text/"):
                return <div className="h-[2.5rem] w-[2.5rem] bg-amber-100 border border-amber-200 rounded-md flex items-center justify-center font-bold text-amber-600 text-[10px] shadow-xs shrink-0">TXT</div>;

            case file_mime_type.includes("zip") || file_mime_type.includes("compressed"):
                return <div className="h-[2.5rem] w-[2.5rem] bg-emerald-100 border border-emerald-200 rounded-md flex items-center justify-center font-bold text-emerald-600 text-[10px] shadow-xs shrink-0">ZIP</div>;

            default:
                return <div className="h-[2.5rem] w-[2.5rem] bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center text-center p-1 text-[9px] leading-tight text-slate-400 font-semibold shadow-xs shrink-0">FILE</div>;
        };
    };

    function open_file_uploading_portal() {
        set_is_file_uploading_portal_open(true);
    };

    function edit_file_name(file_id, current_name) {
        set_editing_file_name(true);
        set_active_file_id(file_id);
        set_input_rename_value(current_name);
    };

    function cancel_editing__file_name() {
        set_editing_file_name(false);
        set_active_file_id(null);
    };

    async function update_file_name() {
        if (!input_rename_value.trim()) return;

        try {
            let document_reference = doc(db_instance, "user_files", active_file_id);
            await updateDoc(document_reference, {
                name: input_rename_value
            });
            set_active_file_id(null);
            set_editing_file_name(false);
            fetch_uploaded_files();
        } catch (error) {
            console.error("Error Updating File Name : ", error);
        };
    };

    async function toggle_favourite_file(file) {
        if (!current_user_email) return;

        const formatted_email = current_user_email.trim().toLowerCase();

        const is_already_favourited = file.favourited_by?.includes(formatted_email);

        try {
            let document_reference = doc(db_instance, "user_files", file.id);

            await updateDoc(document_reference, {
                favourited_by: is_already_favourited
                    ? arrayRemove(formatted_email)
                    : arrayUnion(formatted_email)
            });

            set_uploaded_files_list(prev_list =>
                prev_list.map(item => {
                    if (item.id === file.id) {
                        const current_favs = item.favourited_by || [];
                        return {
                            ...item,
                            favourited_by: is_already_favourited
                                ? current_favs.filter(email => email !== formatted_email)
                                : [...current_favs, formatted_email]
                        };
                    }
                    return item;
                })
            );

        } catch (error) {
            console.error("Error Toggling Favourite Status : ", error);
        };
    };

    function file_favourited_or_not(file) {
        if (!current_user_email || !file.favourited_by) return false;
        return file.favourited_by.includes(current_user_email.trim().toLowerCase());
    };

    function open_file_sharing_portal(file) {
        set_is_file_sharing_portal_open(true);
        set_selected_file_to_share(file);
    };

    function download_file(url) {
        if (!url) return;

        window.open(url, "_blank");
    };

    async function delete_file(file) {
        let verify_user_action = window.confirm("Do You Really Want To Remove This File ?");
        if (!verify_user_action) return;

        try {
            if (file.storage_path) {
                let physical_file_ref = ref(storage_instance, file.storage_path);
                await deleteObject(physical_file_ref);
            }
            await deleteDoc(doc(db_instance, "user_files", file.id));
            fetch_uploaded_files();
        } catch (error) {
            console.error("Error Deleting File : ", error);
        };
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <p className="text-slate-500 animate-pulse">Loading Files...</p>
            </div>
        );
    };

    return (

        <div className="h-full w-full p-3">

            <div className="h-auto w-full flex items-center justify-between">
                <p className="h-auto w-fit my-auto">{uploaded_files_list.length} Files Uploaded</p>
                <button className="rounded h-auto w-fit p-2 bg-blue-500 text-white hover:bg-blue-600" onClick={open_file_uploading_portal}>Upload File</button>
            </div>

            <hr />

            {
                uploaded_files_list.length == 0 ?
                    (
                        <p className="text-center">No Files To Show</p>
                    )
                    :
                    (
                        <div className="files-list h-auto w-full flex flex-col items-start justify-center gap-2">
                            {
                                uploaded_files_list.map((file) => (
                                    <div key={file.id} className="border rounded-lg h-auto w-full bg-white flex items-center justify-between gap-2 p-3">

                                        {render_file_list_preview(file)}

                                        {
                                            (editing_file_name && active_file_id == file.id) ?
                                                (
                                                    <input className="border outline-none rounded-lg h-full w-full p-2" type="text" placeholder="Enter Your Name Here" value={input_rename_value} onChange={(e) => set_input_rename_value(e.target.value)} />
                                                )
                                                :
                                                (
                                                    <p className="h-auto w-auto p-1 m-0 flex-1 truncate">{file.name}</p>
                                                )
                                        }
                                        <div className="h-auto w-auto shrink-0 flex items-center justify-center gap-2">
                                            {
                                                (editing_file_name && active_file_id == file.id) ?
                                                    (
                                                        <>
                                                            <img className="h-[1.7rem] w-auto cursor-pointer opacity-70 hover:opacity-100 transition-opacity" src={Update_Icon} alt="Image Not Available" onClick={update_file_name} />
                                                            <img className="h-[1.7rem] w-auto cursor-pointer opacity-70 hover:opacity-100 transition-opacity" src={Cancel_Icon} alt="Image Not Available" onClick={cancel_editing__file_name} />
                                                        </>
                                                    )
                                                    :
                                                    (
                                                        <img className="h-[1.7rem] w-auto cursor-pointer opacity-70 hover:opacity-100 transition-opacity" src={Edit_Icon} alt="Image Not Available" onClick={() => edit_file_name(file.id, file.name)} />
                                                    )
                                            }
                                            <img className="h-[1.7rem] w-auto cursor-pointer opacity-70 hover:opacity-100 transition-opacity" src={file_favourited_or_not(file) ? Favourite_Icon : Un_Favourite_Icon} alt="Image Not Available" onClick={() => toggle_favourite_file(file)} />
                                            <img className="h-[1.7rem] w-auto cursor-pointer opacity-70 hover:opacity-100 transition-opacity" src={Share_Icon} alt="Image Not Available" onClick={() => open_file_sharing_portal(file)} />
                                            <img className="h-[1.7rem] w-auto cursor-pointer opacity-70 hover:opacity-100 transition-opacity" src={Download_Icon} alt="Image Not Available" onClick={() => download_file(file.download_url)} />
                                            <img className="h-[1.7rem] w-auto cursor-pointer opacity-70 hover:opacity-100 transition-opacity" src={Delete_Icon} alt="Image Not Available" onClick={() => delete_file(file)} />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )
            }

            {
                is_file_uploading_portal_open &&
                ReactDOM.createPortal(<File_Uploading_Portal set_is_file_uploading_portal_open={set_is_file_uploading_portal_open} fetch_uploaded_files={fetch_uploaded_files} />, document.getElementById("file-uploading-portal"))
            }

            {
                is_file_sharing_portal_open &&
                ReactDOM.createPortal(<File_Sharing_Portal set_is_file_sharing_portal_open={set_is_file_sharing_portal_open} selected_file_to_share={selected_file_to_share} />, document.getElementById("file-sharing-portal"))
            }

        </div>

    );

};

export default Uploaded_Files;