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

function RequireAuth({ role, children }) {
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem("careerforge_session"));
  } catch {}
  const token = localStorage.getItem("careerforge_token");
  const authenticated = Boolean(token && session?.role === role);

  useEffect(() => {
    if (!authenticated) {
      window.location.replace(`/login/${role}`);
    }
  }, [authenticated, role]);

  if (!authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas">
        <p className="text-sm font-bold text-muted">Checking your session...</p>
      </main>
    );
  }

  return children;
}

function App() {
  const { pathname } = useLocation();
  let page = <LandingPage />;
  if (pathname === "/login/student") page = <AuthExperience role="student" />;
  else if (pathname === "/login/admin") page = <AuthExperience role="admin" />;
  else if (pathname === "/student") page = <RequireAuth role="student"><StudentWorkspace /></RequireAuth>;
  else if (pathname === "/admin") page = <RequireAuth role="admin"><AdminWorkspace /></RequireAuth>;
  return <><ScrollToTop />{page}</>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </React.StrictMode>,
);
