import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Page_Not_Found() {

    const navigate = useNavigate();

    useEffect(() => {
        let timer = setTimeout(() => {
            navigate("/");
        }, 2000);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    return (

        <div className="h-screen w-screen flex items-center justify-center text-3xl text-red-500">Page Not Found! Re-Routing...</div>

    );

};

export default Page_Not_Found;