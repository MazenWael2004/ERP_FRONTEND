import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

// 1 here means view action.....
// if a user isnt allowed to view data he is redirected to unauhtorized page immediately
// HARDCODED , FIX LATER...

export default function ProtectedRoute(
  {

  route,
  action_code,
  children,
}: any
) {
  const token = localStorage.getItem("access");
    const { hasPermission } = useAuth();
   console.log(hasPermission);
  if (!token) { // if no token, then back to login
    return <Navigate to="/login" replace />;
  }
     // if no pageId/actionId passed, this route only requires being logged in
  if (route !== undefined && !hasPermission(route, action_code)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}