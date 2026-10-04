import { onAuthStateChanged } from "firebase/auth";
import { auth_instance } from "../firebase/Firebase_Config";
import { createContext, useState, useEffect } from "react";

export const Auth_Context = createContext(null);

function Auth_Provider({ children }) {
    const [user, set_user] = useState(null);
    const [loading, set_loading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth_instance, (current_user) => {
            set_user(current_user);
            set_loading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <Auth_Context.Provider value={{ user, loading }}>
            {children}
        </Auth_Context.Provider>
    );
};

export default Auth_Provider;