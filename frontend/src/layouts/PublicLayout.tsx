import { Outlet } from "react-router";
import NavBar from '../components/NavBar';

const PublicLayout = () => {

    return (
        <>
            <NavBar protectedLayout={false} />
            <main className="container my-4">
                <Outlet />
            </main>

        </>
    );
};

export default PublicLayout;