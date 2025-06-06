import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CourtFinder from "./pages/CourtFinder.tsx";
import "./App.css";
import Explore from "./pages/Explore.tsx";
import MobileBottomNav from "./pages/MobileBottomNav.tsx";
import { useState } from "react";

export default function App() {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Explore />} />
        <Route path="/courtfinder" element={<CourtFinder />} />
      </Routes>
      <div className="flex lg:hidden">
        <MobileBottomNav />
      </div>
    </Router>
  );
}
