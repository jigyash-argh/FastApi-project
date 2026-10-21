import { Navigate,Outlet } from "react-router-dom";
function ProtectedRoute() {
  const isAuthenticated = localStorage.getItem("access_token") !== null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
export default ProtectedRoute;