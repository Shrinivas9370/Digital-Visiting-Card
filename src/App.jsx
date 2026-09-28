import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./data/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import CardForm from "./pages/CardForm";
import PublicCard from "./pages/PublicCard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public — no login required */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/card/:slug" element={<PublicCard />} />

          {/* Admin — requires a logged-in account */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/new" element={<ProtectedRoute><CardForm /></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><CardForm /></ProtectedRoute>} />
          <Route path="*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
