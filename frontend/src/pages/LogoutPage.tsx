import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useAuthStore } from "../stores/authStore"

const LogoutPage = () => {
    const logout = useAuthStore((s) => s.logout_user)
    const navigate = useNavigate()

    useEffect(() => {
        const doLogout = async () => {
            await logout()
            navigate("/login")
        }

        doLogout()
    }, [logout, navigate])

    return <p>Logging out...</p>
}

export default LogoutPage