import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {

    const location = useLocation();

    const token = localStorage.getItem("token");

    console.log("========== PROTECTED ROUTE ==========");
    console.log("Current path:", location.pathname);
    console.log("Token:", token);
    console.log("=====================================");

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return children;
}

export default ProtectedRoute;