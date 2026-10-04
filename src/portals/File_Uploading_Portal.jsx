import { db_instance, storage_instance } from "../firebase/Firebase_Config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import useAuth from "../custom_hook/useAuth";
import { useState, useRef } from "react";
import File_Upload_Icon from "/File-Upload-Icon.png";
import Close_Icon from "/Close-Icon.png";

function File_Uploading_Portal({ set_is_file_uploading_portal_open, fetch_uploaded_files }) {

    const { user } = useAuth();
    const current_user_id = user?.uid;

    const file_input_ref = useRef();

    const [portal_going_down, set_portal_going_down] = useState(false);
    const [selected_raw_file, set_selected_raw_file] = useState(null);
    const [selected_file_name, set_selected_file_name] = useState("");
    const [selected_file_type, set_selected_file_type] = useState("");
    const [selected_file_preview_url, set_selected_file_preview_url] = useState("");
    const [is_saving, set_is_saving] = useState(false);
    const [is_dragging, set_is_dragging] = useState(false);

    function div_click() {
        file_input_ref.current.click();
    };

    function file_upload(e) {
        let file = e.target.files[0];
        if (!file) return;

        set_selected_raw_file(file);
        set_selected_file_name(file.name);
        set_selected_file_type(file.type);

        if (file.type.startsWith("image/")) {
            let image_url = URL.createObjectURL(file);
            set_selected_file_preview_url(image_url);
        } else {
            set_selected_file_preview_url("");
        };
    };

    function drag_enter(e) {
        e.preventDefault();
        e.stopPropagation();
        set_is_dragging(true);
    };

    function drag_over(e) {
        e.preventDefault();
        e.stopPropagation();
        set_is_dragging(true);
    };

    function drag_leave(e) {
        e.preventDefault();
        e.stopPropagation();
        set_is_dragging(false);
    };

    function file_drop(e) {
        e.preventDefault();
        e.stopPropagation();
        set_is_dragging(false);

        let file = e.dataTransfer.files[0];
        if (!file) return;

        const simulated_event = {
            target: {
                files: [file]
            }
        };

        file_upload(simulated_event);
    };

    function render_file_preview() {
        switch (true) {
            case selected_file_type.startsWith("image/"):
                return <img className="h-16 w-16 object-cover rounded-md border shadow-xs shrink-0" src={selected_file_preview_url} alt="Preview" />;

            case selected_file_type.startsWith("video/"):
                return <div className="h-16 w-16 bg-purple-100 border border-purple-200 rounded-md flex items-center justify-center font-bold text-purple-600 text-xs shadow-xs shrink-0">VIDEO</div>;

            case selected_file_type === "application/pdf":
                return <div className="h-16 w-16 bg-red-100 border border-red-200 rounded-md flex items-center justify-center font-bold text-red-600 text-xs shadow-xs shrink-0">PDF</div>;

            case selected_file_type.includes("word") || selected_file_type.includes("officedocument"):
                return <div className="h-16 w-16 bg-blue-100 border border-blue-200 rounded-md flex items-center justify-center font-bold text-blue-600 text-xs shadow-xs shrink-0">DOC</div>;

            case selected_file_type.startsWith("text/"):
                return <div className="h-16 w-16 bg-amber-100 border border-amber-200 rounded-md flex items-center justify-center font-bold text-amber-600 text-xs shadow-xs shrink-0">TXT</div>;

            case selected_file_type.includes("zip") || selected_file_type.includes("compressed"):
                return <div className="h-16 w-16 bg-emerald-100 border border-emerald-200 rounded-md flex items-center justify-center font-bold text-emerald-600 text-xs shadow-xs shrink-0">ZIP</div>;

            default:
                return <div className="h-16 w-16 bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center text-center p-1 text-[10px] leading-tight text-slate-400 font-semibold shadow-xs shrink-0">No Preview<br />Available</div>;
        };
    };

    async function upload_file_to_firestore() {
        if (!current_user_id) return;

        if (!selected_file_name.trim()) {
            alert("Please Enter A Valid File Name!");
            return;
        };

        try {
            set_is_saving(true);

            let storage_path = `uploaded_files/${current_user_id}/${Date.now()}-${selected_file_name}`;
            let file_storage_ref = ref(storage_instance, storage_path);

            await uploadBytes(file_storage_ref, selected_raw_file);

            let download_url = await getDownloadURL(file_storage_ref);

            await addDoc(collection(db_instance, "user_files"), {
                name: selected_file_name,
                type: "file",
                file_type: selected_file_type,
                parent_id: "root",
                owner_id: current_user_id,
                size: selected_raw_file.size,
                storage_path: storage_path,
                download_url: download_url,
                shared_with: [],
                favourited_by: [],
                created_at: serverTimestamp()
            });

            if (fetch_uploaded_files) fetch_uploaded_files();
            close_file_uploading_portal();
        } catch (error) {
            console.error("Firestore Upload Error : ", error);
        } finally {
            set_is_saving(false);
        };
    };

    function close_file_uploading_portal() {
        set_portal_going_down(true);

        setTimeout(() => {
            set_is_file_uploading_portal_open(false);
        }, 450);
    };

    return (

        <>
            <div className="fixed inset-0 bg-slate-900/40 z-[99] backdrop-blur-xs" style={{ opacity: portal_going_down ? 0 : 1, transition: "opacity 0.45s ease-out" }} onClick={close_file_uploading_portal}></div>
            <div style={{ animation: portal_going_down ? "glide_down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "glide_up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards", opacity: 0 }} className="rounded-4 shadow-2xl h-fit w-1/2 m-auto z-[100] p-3 fixed inset-0 bg-white flex flex-col items-center justify-center gap-3">
                <div className="h-auto w-full flex items-center justify-between">
                    <p className="h-auto w-full text-xl text-start my-auto">Upload A New File</p>
                    <div className="!rounded-lg h-full w-auto p-2 bg-blue-500 text-white cursor-pointer hover:bg-blue-600" onClick={close_file_uploading_portal}>
                        <img className="h-5" src={Close_Icon} alt="Image Not Available" />
                    </div>
                </div>
                <div className={`border-2 border-dashed rounded-2xl h-[15rem] w-full m-auto flex items-center justify-center cursor-pointer ${is_dragging ? "border-blue-500 bg-blue-50/50 scale-[0.99]" : "border-slate-200 bg-slate-50 hover:border-blue-500 hover:bg-blue-50/50"}`} onClick={div_click} onDragEnter={drag_enter} onDragOver={drag_over} onDragLeave={drag_leave} onDrop={file_drop}>
                    <img className="h-1/2 w-auto pointer-events-none" src={File_Upload_Icon} alt="File Upload Icon" />
                    <input className="hidden" type="file" ref={file_input_ref} onChange={file_upload} />
                </div>
                <input className="border outline-none rounded-lg h-auto w-full p-2" type="text" placeholder="Enter The File's Name" value={selected_file_name} onChange={(e) => set_selected_file_name(e.target.value)} />
                <button className="btn btn-primary w-full py-2 font-semibold tracking-wide" onClick={upload_file_to_firestore} disabled={is_saving}>{is_saving ? "Uploading File..." : "Upload File"}</button>
                {
                    selected_file_name &&
                    (
                        <div className="bg-slate-50 border border-slate-200/60 rounded-xl h-auto w-full p-2 flex items-center justify-start gap-2 overflow-x-auto shrink-0">
                            <div className="flex flex-col items-center border border-slate-200 rounded-xl p-2 bg-white">
                                {render_file_preview()}
                                <small className="text-xs text-truncate max-w-[100px] mt-1">{selected_file_name}</small>
                            </div>
                        </div>
                    )
                }
            </div>
        </>

    );

};

export default File_Uploading_Portal;