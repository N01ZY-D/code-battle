import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { token, isLoading } = useContext(AuthContext);

  if (isLoading) return null; // или можно показать <Loader />

  return token ? children : <Navigate to="/" />;
};

export default PrivateRoute;
