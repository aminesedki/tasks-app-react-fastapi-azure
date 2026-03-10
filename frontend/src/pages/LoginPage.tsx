import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router"
import { toast } from "react-toastify";
const LoginPage = () => {
    const [email, setEmail] = useState<string>('');
    const [pwd, setPwd] = useState<string>('');
    const [error, setError] = useState<string>('');

    const loginUser = useAuthStore((s) => s.login_user)
    const navigate = useNavigate()

    const handleEmailChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        setEmail(e.target.value)
    }

    const handlePwdChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        setPwd(e.target.value)
    }

    const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {

        e.preventDefault();
        const trimmedEmail = email.trim()
        const trimmedPwd = pwd.trim()

        const errorMsg =
            !trimmedEmail ? "Email is empty!" :
                !trimmedPwd ? "Password is empty!" :
                    trimmedPwd.length < 8 ? "Password min length should be 8" :
                        null


        if (errorMsg) {
            setError(errorMsg)
            return
        }

        try {
            await loginUser(trimmedEmail, trimmedPwd)
            toast.success("Login successful")
            navigate("/")
        } catch (error: any) {
            toast.error("Invalid credentials !")
        }



    }

    return <div className="login-wrapper d-flex justify-content-center align-items-center">
        <div className="card shadow p-4" style={{ width: "400px" }}>
            <h3 className="text-center mb-4">Login</h3>

            <form onSubmit={handleLogin}>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        value={email}
                        onChange={handleEmailChange}
                        type="email"
                        className="form-control"
                        placeholder="Enter email"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        value={pwd}
                        onChange={handlePwdChange}
                        type="password"
                        className="form-control"
                        placeholder="Enter password"
                        required
                    />
                </div>


                {error && <div v-if="error" className="alert alert-danger py-2"> {error} </div>}


                <button type="submit" className="btn btn-primary w-100">
                    Login
                </button>

            </form>
        </div>
    </div >

}



export default LoginPage