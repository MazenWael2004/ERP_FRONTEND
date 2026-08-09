import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute(
  {
  children,
}: {
  children: React.ReactNode;
}
) {
  const token = localStorage.getItem("access");

  if (!token) { // if no token, then back to login
    return <Navigate to="/login" replace />;
  }

  return children;
}