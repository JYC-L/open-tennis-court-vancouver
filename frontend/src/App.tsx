import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster, ToastBar, toast } from "react-hot-toast";
import "./App.css";
import CourtFinder from "./pages/CourtFinder.tsx";
import CourtMap from "./pages/CourtMap.tsx";
import Home from "./pages/Home.tsx";
import MobileBottomNav from "./pages/MobileBottomNav.tsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courtfinder" element={<CourtFinder />} />
        <Route path="/court-map" element={<CourtMap />} />
      </Routes>
      <div className="flex mt-20 lg:hidden">
        <MobileBottomNav />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: Infinity, // Make it persistent until manually closed
          style: {
            background: "white",
            color: "#1f2937",
            border: "1px solid #d1d5db",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            padding: "12px 16px",
            paddingRight: "40px", // Extra space for close button
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            maxWidth: "400px",
            width: "auto",
            wordWrap: "break-word",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "white",
            },
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                {t.type !== "loading" && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "8px",
                      background: "none",
                      border: "none",
                      fontSize: "16px",
                      cursor: "pointer",
                      color: "#6b7280",
                      padding: "4px",
                      lineHeight: "1",
                    }}
                  >
                    ×
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
    </Router>
  );
}
