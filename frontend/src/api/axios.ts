import axios from "axios";
import { useNavigate } from "react-router"
import { ACCESS_TOKEN } from '../constants/auth';
import { logout_clear_local_storage } from "./services/auth";
import { useAuthStore } from "../stores/authStore";


const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// request: attach token
api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config
    },
    (error) => {
        return Promise.reject(error.response?.data || error);
    }
);


export default api;


// refresh token & retry on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            try {
                const newAccess = await useAuthStore.getState().refresh_access_token();
                original.headers.Authorization = `Bearer ${newAccess}`;
                return api(original);

            } catch (e) {
                const navigate = useNavigate();
                await logout_clear_local_storage();
                navigate("/login")

            }

        }
        return Promise.reject(error);
    }
);