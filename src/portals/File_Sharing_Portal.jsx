import { db_instance } from "../firebase/Firebase_Config";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import useAuth from "../custom_hook/useAuth";
import { useState } from "react";
import Close_Icon from "/Close-Icon.png";

function File_Sharing_Portal({ set_is_file_sharing_portal_open, selected_file_to_share }) {

    const { user } = useAuth();
    const current_user_email = user?.email;

    const [portal_going_down, set_portal_going_down] = useState(false);
    const [email_input_value, set_email_input_value] = useState("");
    const [emails_list, set_emails_list] = useState([]);
    const [is_sharing, set_is_sharing] = useState(false);

    let already_shared_list = selected_file_to_share?.shared_with || [];

    function close_file_sharing_portal() {
        set_portal_going_down(true);

        setTimeout(() => {
            set_is_file_sharing_portal_open(false);
        }, 450);
    };

    function enter_key_down(e) {
        e.preventDefault();

        let formatted_email = email_input_value.trim().toLowerCase();
        if (!formatted_email) return;

        if (emails_list.includes(formatted_email)) {
            alert("This E-Mail Has Already Been Added!");
            return;
        };

        set_emails_list([...emails_list, formatted_email]);
        set_email_input_value("");
    };

    async function remove_email_from_list(email_to_remove) {
        if (emails_list.includes(email_to_remove)) {
            set_emails_list(emails_list.filter((email) => email !== email_to_remove));
            return;
        };
        if (already_shared_list.includes(email_to_remove)) {
            let verify_action = window.confirm(`Stop Sharing This File With ${email_to_remove}?`);
            if (!verify_action) return;

            try {
                let file_document_ref = doc(db_instance, "user_files", selected_file_to_share.id);

                await updateDoc(file_document_ref, {
                    shared_with: arrayRemove(email_to_remove)
                });

                if (selected_file_to_share?.shared_with) {
                    selected_file_to_share.shared_with = selected_file_to_share.shared_with.filter((email) => email !== email_to_remove);
                };
                set_emails_list([...emails_list]);
            } catch (error) {
                console.error("Error Revoking Access : ", error);
                alert("Failed to remove user access.");
            }
        };
    };

    async function share_file_with_emails() {
        if (!selected_file_to_share?.id) {
            alert("No valid file selected to share!");
            return;
        }

        if (emails_list.length == 0) {
            alert("Please Add At Least One E-Mail Before Sharing!");
            return;
        };

        try {
            set_is_sharing(true);

            let file_document_ref = doc(db_instance, "user_files", selected_file_to_share.id);

            await updateDoc(file_document_ref, {
                shared_with: arrayUnion(...emails_list)
            });

            for (let email of emails_list) {
                try {
                    await fetch("http://localhost:3001/send-notification", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            to: email,
                            file_name: selected_file_to_share.name,
                            shared_by: current_user_email
                        })
                    });
                }
                catch (error) {
                    console.error("Failed To Send E-Mail Notification To", email, error);
                };
            };
            close_file_sharing_portal();
        } catch (error) {
            console.error("Error Sharing File : ", error);
            alert("Failed To Share File! Please Try Again!");
            set_is_sharing(false);
        };
    };

    let combined_display_list = [...already_shared_list, ...emails_list];

    return (

        <>
            <div className="fixed inset-0 bg-slate-900/40 z-[99] backdrop-blur-xs" style={{ opacity: portal_going_down ? 0 : 1, transition: "opacity 0.45s ease-out" }} onClick={close_file_sharing_portal}></div>
            <div style={{ animation: portal_going_down ? "glide_down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "glide_up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards", opacity: 0 }} className="rounded-4 shadow-2xl h-fit w-1/2 m-auto z-[100] p-3 fixed inset-0 bg-white flex flex-col items-center justify-center gap-3">
                <div className="h-auto w-full flex items-center justify-between">
                    <p className="h-auto w-full text-xl text-start my-auto">Shared Your File</p>
                    <div className="!rounded-lg h-full w-auto p-2 bg-blue-500 text-white cursor-pointer hover:bg-blue-600" onClick={close_file_sharing_portal}>
                        <img className="h-5" src={Close_Icon} alt="Image Not Available" />
                    </div>
                </div>
                <form className="h-auto w-full" onSubmit={enter_key_down}>
                    <input className="border rounded-lg outline-none h-auto w-full p-2" type="email" placeholder="Enter The E-Mail You Want To Share Your File With" value={email_input_value} onChange={(e) => set_email_input_value(e.target.value)} />
                </form>
                <div className="border border-slate-100 rounded-lg max-h-[15rem] h-auto w-full bg-slate-50 p-2 flex flex-col items-center justify-start gap-2 overflow-auto">
                    {
                        combined_display_list.length == 0 ?
                            (
                                <span className="text-slate-400 text-sm px-2 py-1">No E-Mails Added Yet...</span>
                            )
                            :
                            (
                                combined_display_list.map((email, index) => (
                                    <div key={index} className="border rounded-lg h-auto w-full bg-blue-100 border border-blue-200 text-blue-700 px-2 py-1 text-sm font-medium flex items-center justify-between gap-2">
                                        <span>{email}</span>
                                        <button className="focus:outline-none font-bold text-xs cursor-pointer ml-1 hover:text-red-500" onClick={() => remove_email_from_list(email)}>✕</button>
                                    </div>
                                ))
                            )
                    }
                </div>
                <button className="rounded h-auto w-full p-2 bg-blue-500 text-white hover:bg-blue-600" disabled={is_sharing} onClick={share_file_with_emails}>{is_sharing ? "Sharing File..." : "Share"}</button>
            </div>
        </>

    );

};

export default File_Sharing_Portal;