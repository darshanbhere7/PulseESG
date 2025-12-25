import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🔐 Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 Role-based restriction (if provided)
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/overview" replace />;
  }

  return children;
}

export default ProtectedRoute;
