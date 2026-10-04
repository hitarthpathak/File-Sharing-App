import { updateProfile, verifyBeforeUpdateEmail, deleteUser } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth_instance, storage_instance } from "../firebase/Firebase_Config";
import useAuth from "../custom_hook/useAuth";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Account_Settings() {

    const { user, loading } = useAuth();
    const current_user_id = user?.uid;

    const profile_picture_ref = useRef();
    const name_ref = useRef();
    const email_ref = useRef();
    const navigate = useNavigate();

    const [user_profile_picture_url, set_user_profile_picture_url] = useState("");
    const [user_name, set_user_name] = useState("");
    const [user_email, set_user_email] = useState("");
    const [ui_message, set_ui_message] = useState({ text: "", type: "" });

    const [editing_name, set_editing_name] = useState(false);
    const [editing_email, set_editing_email] = useState(false);

    function edit_name() {
        set_editing_name(true);
    };

    function edit_email() {
        set_editing_email(true);
    };

    function cancel_editing_name() {
        set_editing_name(false);
    };

    function cancel_editing_email() {
        set_editing_email(false);
    };

    useEffect(() => {
        let current_user = auth_instance.currentUser;
        if (current_user) {
            set_user_name(current_user.displayName || "");
            set_user_email(current_user.email || "");
            set_user_profile_picture_url(current_user.photoURL || "");
        };
    }, [current_user_id]);

    useEffect(() => {
        if (ui_message.text) {
            let timer = setTimeout(() => {
                set_ui_message({ text: "", type: "" })
            }, 5000);
            return () => clearTimeout(timer);
        };
    }, [ui_message.text]);

    function profile_picture_div_click() {
        profile_picture_ref.current.click();
    };

    async function profile_picture_upload(e) {
        let file = e.target.files[0];
        if (!file) return;

        let current_user = auth_instance.currentUser;
        if (!current_user) return;

        try {
            let image_storage_ref = ref(storage_instance, `profile_picture/${current_user.uid}`);
            await uploadBytes(image_storage_ref, file);
            let download_url = await getDownloadURL(image_storage_ref);
            await updateProfile(current_user, { photoURL: download_url });
            set_user_profile_picture_url(download_url);
            set_ui_message({
                text: "Profile Picture Uploaded Successfully!",
                type: "success"
            });
        }
        catch (error) {
            set_ui_message({
                text: "Failed To Upload Profile Picture!",
                type: "danger"
            });
            console.error("Error Uploading Profile Picture : ", error);
        };
    };

    async function update_name() {
        let current_user = auth_instance.currentUser;
        if (!current_user) return;

        let updated_name = name_ref.current.value;

        try {
            await updateProfile(current_user, { displayName: updated_name });
            set_user_name(updated_name);
            set_editing_name(false);
            set_ui_message({
                text: "Name Updated Successfully!",
                type: "success"
            });
        } catch (error) {
            set_ui_message({
                text: "Failed To Update Name!",
                type: "danger"
            });
            console.error("Error Updating Name : ", error);
        };
    };

    async function update_email() {
        let current_user = auth_instance.currentUser;
        if (!current_user) return;

        let updated_email = email_ref.current.value;

        try {
            await verifyBeforeUpdateEmail(current_user, updated_email);
            set_user_email(updated_email);
            set_editing_email(false);
            set_ui_message({
                text: "Verification E-Mail Sent! Please Check Your Inbox!",
                type: "success"
            });
        } catch (error) {
            set_ui_message({
                text: "Failed To Update E-Mail!",
                type: "danger"
            });
            console.error("Error Updating E-Mail : ", error);
        };
    };

    async function delete_account() {
        let current_user = auth_instance.currentUser;
        if (!current_user) return;

        let confirm_delete = window.confirm("Are You Sure That You Want To Delete Your Account ?");
        if (!confirm_delete) return;

        try {
            await deleteUser(current_user);
            console.log("Account Deleted Successfully!");
            navigate("/registration");
        } catch (error) {
            set_ui_message({
                text: "Failed To Delete Account!",
                type: "danger"
            });
            console.error("Error During Account Deletion : ", error);
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

        <div className="h-full w-full p-3 flex flex-col gap-3">

            {
                ui_message.text && (<div className={`m-0 alert alert-${ui_message.type}`}>{ui_message.text}</div>)
            }

            <div className="h-auto w-auto px-5 py-3 flex flex-col items-center justify-center gap-3">
                <div className="border-2 border-dotted border-blue-700 rounded-full h-[12rem] w-[12rem] m-auto flex items-center justify-center cursor-pointer overflow-hidden hover:bg-slate-100" onClick={profile_picture_div_click}>
                    {
                        user_profile_picture_url ?
                            (
                                <img className="h-full w-full object-cover rounded-full" src={user_profile_picture_url} alt="Image Not Available" />
                            )
                            :
                            (
                                <span className="text-center">Click To Upload Profile Picture</span>
                            )
                    }
                    <input className="hidden" type="file" ref={profile_picture_ref} onChange={profile_picture_upload} />
                </div>

                <div className="h-auto w-auto flex items-center justify-between gap-2">
                    {
                        editing_name ?
                            (
                                <>
                                    <input className="border outline-none rounded-lg h-full w-[15rem] px-2" type="text" placeholder="Enter Your Name Here" ref={name_ref} defaultValue={user_name} />
                                    <div className="h-auto w-auto flex items-center justify-center gap-1">
                                        <button className="!rounded-lg h-auto w-auto p-2 bg-blue-200 hover:bg-blue-300" onClick={update_name}>Update</button>
                                        <button className="!rounded-lg h-auto w-auto p-2 bg-blue-200 hover:bg-blue-300" onClick={cancel_editing_name}>Cancel</button>
                                    </div>
                                </>
                            )
                            :
                            (
                                <>
                                    <span className="border rounded-lg h-full w-[15rem] px-2 flex items-center justify-start">{user_name}</span>
                                    <button className="!rounded-lg h-auto w-25 p-2 bg-blue-500 text-white hover:bg-blue-600" onClick={edit_name}>Edit</button>
                                </>
                            )
                    }
                </div>

                <div className="h-auto w-auto flex items-center justify-between gap-2">
                    {
                        editing_email ?
                            (
                                <>
                                    <input className="border outline-none rounded-lg h-full w-[15rem] px-2" type="email" placeholder="Enter Your E-Mail Here" ref={email_ref} defaultValue={user_email} />
                                    <div className="h-auto w-auto flex items-center justify-center gap-1">
                                        <button className="!rounded-lg h-auto w-auto p-2 bg-blue-200 hover:bg-blue-300" onClick={update_email}>Update</button>
                                        <button className="!rounded-lg h-auto w-auto p-2 bg-blue-200 hover:bg-blue-300" onClick={cancel_editing_email}>Cancel</button>
                                    </div>
                                </>
                            )
                            :
                            (
                                <>
                                    <span className="border rounded-lg h-full w-[15rem] px-2 flex items-center justify-start">{user_email}</span>
                                    <button className="!rounded-lg h-auto w-25 p-2 bg-blue-500 text-white hover:bg-blue-600" onClick={edit_email}>Edit</button>
                                </>
                            )
                    }
                </div>

            </div>

            <div className="h-auto w-full px-5 py-3 flex items-center justify-center gap-5">
                <button className="!rounded-lg h-auto w-[25%] p-2 bg-red-500 text-white" onClick={delete_account}>Delete Account</button>
            </div>

        </div>

    );

};

export default Account_Settings;