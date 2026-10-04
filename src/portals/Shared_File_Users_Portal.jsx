import { useState } from "react";
import Close_Icon from "/Close-Icon.png";

function Shared_File_Users_Portal({ set_is_shared_file_users_portal_open, shared_files_history_list, revoke_file_access, active_file_id }) {

    const [portal_going_down, set_portal_going_down] = useState(false);

    function close_shared_file_users_portal() {
        set_portal_going_down(true);

        setTimeout(() => {
            set_is_shared_file_users_portal_open(false);
        }, 450);
    };

    let current_active_file = shared_files_history_list.find((file) => file.id == active_file_id);

    return (

        <>
            <div className="fixed inset-0 bg-slate-900/40 z-[99] backdrop-blur-xs" style={{ opacity: portal_going_down ? 0 : 1, transition: "opacity 0.45s ease-out" }} onClick={close_shared_file_users_portal}></div>
            <div style={{ animation: portal_going_down ? "glide_down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "glide_up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards", opacity: 0 }} className="rounded-4 shadow-2xl h-fit w-1/2 m-auto z-[100] p-3 fixed inset-0 bg-white flex flex-col items-center justify-center gap-3">
                <div className="h-auto w-full flex items-center justify-between">
                    <p className="h-auto w-full text-xl text-start my-auto">You Shared This File With The Following Users</p>
                    <div className="!rounded-lg h-full w-auto p-2 bg-blue-500 text-white cursor-pointer hover:bg-blue-600" onClick={close_shared_file_users_portal}>
                        <img className="h-5" src={Close_Icon} alt="Image Not Available" />
                    </div>
                </div>
                <div className="border border-slate-100 rounded-lg max-h-[15rem] h-auto w-full bg-slate-50 p-2 flex flex-col items-center justify-start gap-2 overflow-auto">
                    {
                        (current_active_file?.shared_with && current_active_file.shared_with.length > 0) ?
                            (
                                current_active_file.shared_with.map((email, index) => (
                                    <div key={index} className="border rounded-lg h-auto w-full bg-blue-100 border border-blue-200 text-blue-700 px-2 py-1 text-sm font-medium flex items-center justify-between gap-2">
                                        <span>{email}</span>
                                        <button className="focus:outline-none font-bold text-xs cursor-pointer ml-1 hover:text-red-500" onClick={() => revoke_file_access(current_active_file.id, email)}>✕</button>
                                    </div>
                                ))
                            )
                            :
                            (
                                <p className="text-xs text-slate-400 text-center w-full py-2">No active users assigned to this document.</p>
                            )
                    }
                </div>
            </div>
        </>

    );

};

export default Shared_File_Users_Portal;