import { signOut } from "firebase/auth";
import { auth_instance } from "../firebase/Firebase_Config";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();

    const [update_status, set_update_status] = useState("");

    async function logout_user() {
        try {
            await signOut(auth_instance);
            console.log("User Logged Out Successfully!");
            navigate("/login");
        } catch (error) {
            set_update_status("Error Logging Out!");
            console.error("Error During Logout : ", error);
        };
    };

    return (

        <div className="h-full w-[15%] p-2 shadow-lg shrink-0 flex flex-col items-center justify-between">

            <div className="h-fit w-full flex flex-col items-center justify-start gap-2">

                <NavLink className={({ isActive }) => `!rounded-lg h-auto w-full text-center p-2 bg-blue-200 cursor-pointer hover:bg-blue-300 ${isActive ? "bg-blue-300" : "bg-blue-200"}`} to={"/uploaded-files"}>

                    <button>Uploaded Files</button>

                </NavLink>

                <NavLink className={({ isActive }) => `!rounded-lg h-auto w-full text-center p-2 bg-blue-200 cursor-pointer hover:bg-blue-300 ${isActive ? "bg-blue-300" : "bg-blue-200"}`} to={"/shared-with-me"}>

                    <button>Shared With Me</button>

                </NavLink>

                <NavLink className={({ isActive }) => `!rounded-lg h-auto w-full text-center p-2 bg-blue-200 cursor-pointer hover:bg-blue-300 ${isActive ? "bg-blue-300" : "bg-blue-200"}`} to={"/shared-files"}>

                    <button>Shared Files</button>

                </NavLink>

                <NavLink className={({ isActive }) => `!rounded-lg h-auto w-full text-center p-2 bg-blue-200 cursor-pointer hover:bg-blue-300 ${isActive ? "bg-blue-300" : "bg-blue-200"}`} to={"/favourites"}>

                    <button>Favourites</button>

                </NavLink>

                <NavLink className={({ isActive }) => `!rounded-lg h-auto w-full text-center p-2 bg-blue-200 cursor-pointer hover:bg-blue-300 ${isActive ? "bg-blue-300" : "bg-blue-200"}`} to={"/account-settings"}>

                    <button>Account Settings</button>

                </NavLink>

            </div>

            <div className="h-auto w-full">

                <button className="!rounded-lg h-auto w-full p-2 bg-blue-500 text-white hover:bg-blue-600" onClick={logout_user}>Log Out</button>

            </div>

        </div>

    );

};

export default Sidebar;