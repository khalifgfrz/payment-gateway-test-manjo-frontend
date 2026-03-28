import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Tracker from "./pages/Tracker";
import GenerateQR from "./pages/GenerateQR";
import Payment from "./pages/Payment";
import GetAll from "./pages/GetAll";

function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Tracker" },
    { path: "/generate", label: "Generate QR" },
    { path: "/payment", label: "Payment" },
    { path: "/all", label: "All Transactions" },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Payment Gateway</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                location.pathname === item.path
                  ? "bg-white text-blue-600"
                  : "hover:bg-blue-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Tracker />} />
          <Route path="/generate" element={<GenerateQR />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/all" element={<GetAll />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
