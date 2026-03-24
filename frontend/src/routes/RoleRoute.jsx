import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

function RoleRoute({ children, allowRoles = [] }) {
  const user = useAuthStore((state) => state.user);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  // កំពុងពិនិត្យ auth
  if (isCheckingAuth) {
    return <div>កំពុងពិនិត្យការចូលប្រើ...</div>;
  }

  // មិនទាន់ login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // មិនមានសិទ្ធិ (role មិនត្រូវ)
  if (allowRoles.length > 0 && !allowRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // អនុញ្ញាត
  return children;
}

export default RoleRoute;