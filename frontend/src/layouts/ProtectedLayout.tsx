import { Navigate, Outlet, useLocation } from "react-router";
import NavBar from '../components/NavBar';
import { useAuthStore } from "../stores/authStore";

const ProtectedLayout = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />

    }

    return (
        <>
            <NavBar protectedLayout={isAuthenticated} />
            <main className="container my-4">
                <Outlet />
            </main>

        </>
    );

};

export default ProtectedLayout;