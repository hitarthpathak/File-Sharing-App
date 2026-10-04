import { db_instance } from "../firebase/Firebase_Config";
import { collection, query, where, getDocs, doc, updateDoc, arrayRemove } from "firebase/firestore";
import useAuth from "../custom_hook/useAuth";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Download_Icon from "/Download-Icon.png";
import Shared_File_Users_Portal from "../portals/Shared_File_Users_Portal";

function Shared_Files() {

    const { user, loading } = useAuth();
    const current_user_id = user?.uid;

    const [is_shared_file_users_portal_open, set_is_shared_file_users_portal_open] = useState(false);
    const [shared_files_history_list, set_shared_files_history_list] = useState([]);
    const [is_loading, set_is_loading] = useState(false);
    const [active_file_id, set_active_file_id] = useState(null);

    useEffect(() => {
        if (current_user_id) {
            fetch_shared_history();
        } else {
            set_shared_files_history_list([]);
        };
    }, [current_user_id]);

    async function fetch_shared_history() {
        if (!current_user_id) return;

        try {
            set_is_loading(true);

            let query_to_fetch_all_files_by_user = query(collection(db_instance, "user_files"), where("owner_id", "==", current_user_id), where("type", "==", "file"));

            let query_snapshot = await getDocs(query_to_fetch_all_files_by_user);
            let files_collection = [];

            query_snapshot.forEach((document) => {
                let data = document.data();
                if (data.shared_with && data.shared_with.length > 0) {
                    files_collection.push({ id: document.id, ...data });
                };
            });

            set_shared_files_history_list(files_collection);
        } catch (error) {
            console.error("Error Fetching Shared History : ", error);
        } finally {
            set_is_loading(false);
        };
    };

    function open_shared_file_users_portal(file_id) {
        set_active_file_id(file_id);
        set_is_shared_file_users_portal_open(true);
    };

    async function revoke_file_access(file_id, email_to_remove) {
        let verify_action = window.confirm(`Stop Sharing This File With ${email_to_remove}?`);
        if (!verify_action) return;

        try {
            let document_reference = doc(db_instance, "user_files", file_id);

            await updateDoc(document_reference, {
                shared_with: arrayRemove(email_to_remove)
            });

            set_shared_files_history_list((prev_list) => (
                prev_list.map((file) => {
                    if (file.id === file_id) {
                        return { ...file, shared_with: file.shared_with.filter((email) => email !== email_to_remove) };
                    };
                    return file;
                }).filter((file) => file.shared_with.length > 0)
            ));
        } catch (error) {
            console.error("Error Revoking Access : ", error);
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

    async function download_file(url) {
        if (!url) return;

        window.open(url, "_blank");
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
                <p className="h-auto w-full my-auto">You Shared {shared_files_history_list.length} Files</p>
            </div>

            <hr />

            {
                is_loading ?
                    (
                        <p className="text-center text-slate-500">Loading Shared Documents...</p>
                    )
                    :
                    shared_files_history_list.length == 0 ?
                        (
                            <p className="text-center">No Files To Show</p>
                        )
                        :
                        (
                            <div className="files-list h-auto w-full flex flex-col items-start justify-center gap-2">
                                {
                                    shared_files_history_list.map((file) => (
                                        <div key={file.id} className="border rounded-lg h-auto w-full bg-white flex items-center justify-between gap-2 p-3">
                                            {render_file_list_preview(file)}
                                            <p className="h-auto w-auto p-1 m-0 flex-1 truncate">{file.name}</p>
                                            <div className="h-auto w-auto shrink-0 flex items-center justify-center gap-2">
                                                <img className="h-[1.7rem] w-auto cursor-pointer opacity-70 hover:opacity-100 transition-opacity" src={Download_Icon} alt="Download File" onClick={() => download_file(file.download_url)} />
                                            </div>
                                            <button className="rounded h-auto w-fit p-2 bg-blue-500 text-white hover:bg-blue-600" onClick={() => open_shared_file_users_portal(file.id)}>Shared With</button>
                                        </div>
                                    ))
                                }
                            </div>
                        )
            }

            {
                is_shared_file_users_portal_open &&
                ReactDOM.createPortal(<Shared_File_Users_Portal set_is_shared_file_users_portal_open={set_is_shared_file_users_portal_open} shared_files_history_list={shared_files_history_list} revoke_file_access={revoke_file_access} active_file_id={active_file_id} />, document.getElementById("file-sharing-portal"))
            }

        </div>

    );

};

export default Shared_Files;