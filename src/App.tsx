import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Tracker from "./pages/Tracker";
import GenerateQR from "./pages/GenerateQR";
import Payment from "./pages/Payment";

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-green-700 text-white p-4 flex gap-6">
        <Link to="/">Tracker</Link>
        <Link to="/generate">Generate QR</Link>
        <Link to="/payment">Payment</Link>
      </div>

      <Routes>
        <Route path="/" element={<Tracker />} />
        <Route path="/generate" element={<GenerateQR />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </BrowserRouter>
  );
}
