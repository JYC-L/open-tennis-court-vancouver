import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
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
    </Router>
  );
}
