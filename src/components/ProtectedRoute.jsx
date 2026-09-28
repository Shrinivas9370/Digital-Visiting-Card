import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../data/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  if (user === null) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
