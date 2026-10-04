import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../custom_hook/useAuth";

function Protected_Route() {

    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
                <p className="text-lg font-medium text-slate-500 animate-pulse">Verifying Session Configuration...</p>
            </div>
        );
    };

    return (

        user ? <Outlet /> : <Navigate to="/login" replace />

    );

};

export default Protected_Route;