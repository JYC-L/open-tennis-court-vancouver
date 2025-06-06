import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Calender from "./pages/Calender.tsx";
import "./App.css";
import Home from "./pages/Home.tsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calender" element={<Calender />} />
      </Routes>
    </Router>
  );
}
