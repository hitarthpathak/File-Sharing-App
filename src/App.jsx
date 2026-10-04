import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Protected_Route from "./components/Protected_Route";
import Sidebar from "./components/Sidebar";
import Uploaded_Files from "./pages/Uploaded_Files";
import Shared_With_Me from "./pages/Shared_With_Me";
import Shared_Files from "./pages/Shared_Files";
import Favourites from "./pages/Favourites";
import Account_Settings from "./pages/Account_Settings";
import Page_Not_Found from "./pages/Page_Not_Found";

function App() {

  function App_Layout() {
    return (
      <div className="h-screen w-full flex">
        <Sidebar />
        <div className="h-full w-[85%] overflow-y-auto border">
          <Outlet />
        </div>
      </div>
    );
  };

  return (

    <div className="h-screen w-screen flex items-center justify-center">

      <Routes>

        <Route path="/" element={<Navigate to="/uploaded-files" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />

        <Route element={<Protected_Route />}>
          <Route element={<App_Layout />}>
            <Route path="/uploaded-files" element={<Uploaded_Files />} />
            <Route path="/shared-with-me" element={<Shared_With_Me />} />
            <Route path="/shared-files" element={<Shared_Files />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/account-settings" element={<Account_Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Page_Not_Found />} />

      </Routes>

    </div>

  );

};

export default App;