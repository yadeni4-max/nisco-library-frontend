import { Navigate } from "react-router-dom";
import { isAuthenticated, getRole } from "../utils/auth";

function ProtectedRoute({ children, allowedRoles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const role = getRole();

  // If roles are defined, enforce role-based access
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;