import { useContext } from "react";
import { Auth_Context } from "../context/Auth_Context";

function useAuth() {

    const context = useContext(Auth_Context);

    if (!context) {
        throw new Error("useAuth Must Be Used Within Auth_Provider!");
    };

    return context;
};

export default useAuth;