import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { useDarkMode } from "../darkMode_context/DarkModeContext";
import FloatingActionsRight from "../navbar/FloatingCommandBar";
import { useImpersonation } from "../perstectiva/ImpersonationProviderr";

export default function Layout() {
    const { darkMode } = useDarkMode();
    const { isViewOnly } = useImpersonation();

    return (
        <div className={`flex h-screen ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
            <FloatingActionsRight />
            <Sidebar />
            <main className={`relative flex-1 overflow-y-auto p-8 ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>

                {isViewOnly && (
                    <style>{`
                        .view-only-content button,
                        .view-only-content input,
                        .view-only-content select,
                        .view-only-content textarea,
                        .view-only-content [role="button"],
                        .view-only-content [role="menuitem"],
                        .view-only-content [role="switch"] {
                            pointer-events: none !important;
                            opacity: 0.5 !important;
                            cursor: not-allowed !important;
                        }
                    `}</style>
                )}

                <div className="view-only-content">
                    <Outlet />
                </div>

            </main>
        </div>
    );
}