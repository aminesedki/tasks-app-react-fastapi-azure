import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import { useAuthStore } from "../stores/authStore";

type Props = {
    protectedLayout: boolean
}

const NavBar = ({ protectedLayout = false }: Props) => {
    const [open, setOpen] = useState(false);
    const [isProtectedLayout, setProtectedLayout] = useState<boolean>(false);
    const user = useAuthStore((s) => s.user);

    useEffect(() => {

        setProtectedLayout(protectedLayout);

    }, [protectedLayout])

    const handleCollapseBtn = () => setOpen(!open)
    const navItems = isProtectedLayout ? <>

        <ul className="navbar-nav">
            <li className="nav-item">
                <NavLink className="nav-link" to="/projects">
                    Projects
                </NavLink>
            </li>
        </ul>

        <ul className="navbar-nav ms-auto">

            <li className="nav-item">
                <NavLink className="nav-link" to="/logout">
                    Logout ({user?.email})
                </NavLink>
            </li>

        </ul>

    </> : <>
        <ul className="navbar-nav ms-auto">
            <li className="nav-item">
                <NavLink className="nav-link" to="/login">
                    Login
                </NavLink>
            </li>
            <li className="nav-item">
                <NavLink className="nav-link" to="/register">
                    Register
                </NavLink>
            </li>

        </ul>

    </>

    return <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">

            <NavLink className="navbar-brand" to="/">
                WorkLog
            </NavLink>

            <button
                className="navbar-toggler"
                type="button"
                onClick={handleCollapseBtn}
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className={`navbar-collapse collapse ${open ? "show" : ""}`}>
                {navItems}
            </div>
        </div>
    </nav>
}


export default NavBar