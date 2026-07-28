import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import LandingPage from "../components/LandingPage";
import AuthExperience from "../components/AuthExperience";
import StudentWorkspace from "../components/student/StudentWorkspace";
import AdminWorkspace from "../components/admin/AdminWorkspace";
import { RouterProvider, useLocation } from "../lib/router";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function App() {
  const { pathname } = useLocation();
  let page = <LandingPage />;
  if (pathname === "/login/student") page = <AuthExperience role="student" />;
  else if (pathname === "/login/admin") page = <AuthExperience role="admin" />;
  else if (pathname === "/student") page = <StudentWorkspace />;
  else if (pathname === "/admin") page = <AdminWorkspace />;
  return <><ScrollToTop />{page}</>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </React.StrictMode>,
);
