import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CourtFinder from "./pages/CourtFinder.tsx";
import "./App.css";
import Explore from "./pages/Explore.tsx";
import MobileBottomNav from "./pages/MobileBottomNav.tsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Explore />} />
        <Route path="/courtfinder" element={<CourtFinder />} />
      </Routes>
      <div className="flex mt-20 lg:hidden">
        <MobileBottomNav />
      </div>
    </Router>
  );
}
