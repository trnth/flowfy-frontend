import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isVerified, loading } = useSelector((s) => s.auth);

  if (loading) return <div>Loading...</div>;
  if (!isVerified) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
