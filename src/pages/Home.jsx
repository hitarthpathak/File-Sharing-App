import { auth_instance } from "../firebase/Firebase_Config";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Uploaded_Files from "./Uploaded_Files";
import Shared_With_Me from "./Shared_With_Me";
import Shared_Files from "./Shared_Files";
import Favourites from "./Favourites";
import Account_Settings from "./Account_Settings";

function Home() {

    const [data, set_data] = useState("/uploaded-files");
    const [user, set_user] = useState(null);
    const [loading, set_loading] = useState(true);

    useEffect(() => {
        let unsubscribe = onAuthStateChanged(auth_instance, (current_user) => {
            set_user(current_user);
            set_loading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {

        return (

            <div className="h-screen w-full flex items-center justify-center bg-slate-50">

                <p className="text-lg font-medium text-slate-500 animate-pulse">Verifying Session Configuration...</p>

            </div>

        );

    };

    return (

        <div className="home h-screen w-full flex items-center justify-center">

            <Sidebar set_data={set_data} />

            <div className="data border h-full w-[85%] overflow-y-auto">

                {/* {data == "/uploaded-files" && <Uploaded_Files current_user_id={user ? user.uid : null} current_user_email={user ? user.email : null} />}

                {data == "/shared-with-me" && <Shared_With_Me current_user_email={user ? user.email : null} />}

                {data == "/shared-files" && <Shared_Files current_user_id={user ? user.uid : null} />}

                {data == "/favourites" && <Favourites current_user_email={user ? user.email : null} />}

                {data == "/account-settings" && <Account_Settings current_user_id={user ? user.uid : null} />} */}

            </div>

        </div>

    );

};

export default Home;