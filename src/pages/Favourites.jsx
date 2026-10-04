import { db_instance } from "../firebase/Firebase_Config";
import { collection, query, where, getDocs } from "firebase/firestore";
import useAuth from "../custom_hook/useAuth";
import { useState, useEffect } from "react";
import Download_Icon from "/Download-Icon.png";

function Favourites() {

    const { user, loading } = useAuth();
    const current_user_email = user?.email;

    const [favourite_files_list, set_favourite_files_list] = useState([]);
    const [is_loading, set_is_loading] = useState(false);

    useEffect(() => {
        if (current_user_email) {
            fetch_favourite_files();
        }
        else {
            set_favourite_files_list([]);
        };
    }, [current_user_email]);

    async function fetch_favourite_files() {
        if (!current_user_email) return;

        try {
            set_is_loading(true);

            let favourite_query = query(collection(db_instance, "user_files"), where("favourited_by", "array-contains", current_user_email.trim().toLowerCase()));

            let query_snapshot = await getDocs(favourite_query);
            let files_collection = [];

            query_snapshot.forEach((document) => {
                files_collection.push({ id: document.id, ...document.data() });
            });

            set_favourite_files_list(files_collection);
        } catch (error) {
            console.error("Error Fetching Favourite Files : ", error);
        } finally {
            set_is_loading(false);
        };
    };

    function render_file_list_preview(file) {
        const file_mime_type = file.file_type || "";

        switch (true) {
            case file_mime_type.startsWith("image/"):
                return <img className="h-[2.5rem] w-[2.5rem] object-cover rounded-md border shadow-sm shrink-0" src={file.download_url} alt="Preview" />;

            case file_mime_type.startsWith("video/"):
                return <div className="h-[2.5rem] w-[2.5rem] bg-purple-100 border border-purple-200 rounded-md flex items-center justify-center font-bold text-purple-600 text-[9px] shadow-sm shrink-0">VIDEO</div>;

            case file_mime_type === "application/pdf":
                return <div className="h-[2.5rem] w-[2.5rem] bg-red-100 border border-red-200 rounded-md flex items-center justify-center font-bold text-red-600 text-[10px] shadow-sm shrink-0">PDF</div>;

            case file_mime_type.includes("word") || file_mime_type.includes("officedocument"):
                return <div className="h-[2.5rem] w-[2.5rem] bg-blue-100 border border-blue-200 rounded-md flex items-center justify-center font-bold text-blue-600 text-[10px] shadow-sm shrink-0">DOC</div>;

            case file_mime_type.startsWith("text/"):
                return <div className="h-[2.5rem] w-[2.5rem] bg-amber-100 border border-amber-200 rounded-md flex items-center justify-center font-bold text-amber-600 text-[10px] shadow-sm shrink-0">TXT</div>;

            case file_mime_type.includes("zip") || file_mime_type.includes("compressed"):
                return <div className="h-[2.5rem] w-[2.5rem] bg-emerald-100 border border-emerald-200 rounded-md flex items-center justify-center font-bold text-emerald-600 text-[10px] shadow-sm shrink-0">ZIP</div>;

            default:
                return <div className="h-[2.5rem] w-[2.5rem] bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center text-center p-1 text-[9px] leading-tight text-slate-400 font-semibold shadow-sm shrink-0">FILE</div>;
        };
    };

    async function download_file(url) {
        if (!url) return;

        window.open(url, "_blank");
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <p className="text-slate-500 animate-pulse">Loading Files...</p>
            </div>
        );
    };

    return (

        <div className="h-full w-full p-3">

            <div className="h-auto w-full flex items-center justify-between">
                <p className="h-auto w-full my-auto">{favourite_files_list.length} Files Favourited</p>
            </div>

            <hr />

            {
                is_loading ?
                    (
                        <p className="text-center text-slate-500">Loading Favourite Documents...</p>
                    )
                    :
                    favourite_files_list.length == 0 ?
                        (
                            <p className="text-center">No Files To Show</p>
                        )
                        :
                        (
                            <div className="files-list h-auto w-full flex flex-col items-start justify-center gap-2">
                                {
                                    favourite_files_list.map((file) => (
                                        <div key={file.id} className="border rounded-lg h-auto w-full bg-white flex items-center justify-between gap-2 p-3">
                                            {render_file_list_preview(file)}
                                            <p className="h-auto w-auto p-1 m-0 flex-1 truncate">{file.name}</p>
                                            <div className="h-auto w-auto shrink-0 flex items-center justify-center gap-2">
                                                <img className="h-[1.7rem] w-auto cursor-pointer opacity-70 hover:opacity-100 transition-opacity" src={Download_Icon} alt="Download File" onClick={() => download_file(file.download_url)} />
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        )
            }

        </div>

    );

};

export default Favourites;