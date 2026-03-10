import { create } from "zustand";
import { login, get_me, logout_clear_local_storage, refresh_token } from "../api/services/auth";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_PROFILE } from "../constants/auth";
import { type UserProfile } from "../shared-types/auth";

type AuthState = {
    access: string | null;
    refresh: string | null;
    user: UserProfile | null;

    isAuthenticated: boolean;
    isAuthReady: boolean;

    // setters
    setAccessToken: (token: string | null) => void;
    setRefreshToken: (token: string | null) => void;
    setUserProfile: (userData: UserProfile | null) => void;

    // lifecycle
    initializeAuth: () => Promise<void>;

    // actions
    login_user: (email: string, password: string) => Promise<UserProfile>;
    logout_user: () => Promise<void>;
    refresh_access_token: () => Promise<string>;
};

function loadUserFromStorage(): UserProfile | null {
    const raw = localStorage.getItem(USER_PROFILE);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
}

function clearAuthStorage() {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(USER_PROFILE);
}

export const useAuthStore = create<AuthState>((set, get) => ({
    // hydrated state
    access: localStorage.getItem(ACCESS_TOKEN),
    refresh: localStorage.getItem(REFRESH_TOKEN),
    user: loadUserFromStorage(),

    // IMPORTANT: don't trust localStorage fully; initializeAuth will verify
    isAuthenticated: false,
    isAuthReady: false,

    setAccessToken: (token) => {
        if (token) localStorage.setItem(ACCESS_TOKEN, token);
        else localStorage.removeItem(ACCESS_TOKEN);

        set({
            access: token,
            isAuthenticated: !!token, // token present => authenticated (will be confirmed by initializeAuth)
        });
    },

    setRefreshToken: (token) => {
        if (token) localStorage.setItem(REFRESH_TOKEN, token);
        else localStorage.removeItem(REFRESH_TOKEN);

        set({ refresh: token });
    },

    setUserProfile: (userData) => {
        if (userData) localStorage.setItem(USER_PROFILE, JSON.stringify(userData));
        else localStorage.removeItem(USER_PROFILE);

        set({ user: userData });
    },

    initializeAuth: async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);

        // no token => not authenticated, but "ready"
        if (!token) {
            set({
                access: null,
                refresh: localStorage.getItem(REFRESH_TOKEN),
                user: loadUserFromStorage(),
                isAuthenticated: false,
                isAuthReady: true,
            });
            return;
        }

        // token exists -> verify with backend
        try {
            set({ access: token }); // keep it in state for request headers if needed
            const profile = await get_me(); // return 200 if token valid
            get().setUserProfile(profile);

            set({
                isAuthenticated: true,
                isAuthReady: true,
            });
        } catch (e) {
            // invalid/expired/fake token => clear everything
            clearAuthStorage();
            set({
                access: null,
                refresh: null,
                user: null,
                isAuthenticated: false,
                isAuthReady: true,
            });
        }
    },

    login_user: async (email, password) => {
        const data = await login(email, password);

        const accessToken = data.access_token as string;
        get().setAccessToken(accessToken);

        // If your backend doesn't return user profile in login response:
        const profile = await get_me();
        get().setUserProfile(profile);

        set({ isAuthenticated: true });

        return profile;
    },

    logout_user: async () => {
        try {
            await logout_clear_local_storage(); // if it exists; may be optional
        } finally {
            clearAuthStorage();
            set({
                access: null,
                refresh: null,
                user: null,
                isAuthenticated: false,
                isAuthReady: true,
            });
        }
    },
    refresh_access_token: async () => {
        const refresh = localStorage.getItem(REFRESH_TOKEN);
        if (!refresh) throw new Error("No refresh token");

        // call your backend refresh endpoint
        const data = await refresh_token(refresh);

        const newAccess = data.access_token as string;
        // updates localStorage + state
        get().setAccessToken(newAccess);
        set({ isAuthenticated: true });

        return newAccess;
    },
}));