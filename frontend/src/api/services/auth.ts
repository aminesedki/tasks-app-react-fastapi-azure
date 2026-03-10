import api from "../axios";
import {
    ACCESS_TOKEN,
    REFRESH_TOKEN,
    USER_PROFILE,
    REGISTER_PATH,
    LOGIN_PATH,
    REFRESH_TOKEN_PATH,
    ME_PATH
} from "../../constants/auth";
import { type UserProfile, type CreatedUserType, type TokenType, type RefreshTokenType } from '../../shared-types/auth';

export async function register(
    email: string,
    password: string): Promise<CreatedUserType> {

    const payload = { email, password };

    const response = await api.post(REGISTER_PATH, payload);
    return response.data;

}

export async function login(
    email: string,
    password: string): Promise<TokenType> {


    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);

    const response = await api.post(LOGIN_PATH, form, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    return response.data;

}

export async function refresh_token(refreshToken: string): Promise<RefreshTokenType> {

    const response = await api.post(REFRESH_TOKEN_PATH, { refreshToken });

    return response.data;

}

export async function get_me(): Promise<UserProfile> {

    const response = await api.get(ME_PATH);
    return response.data;

}



export async function logout_clear_local_storage(): Promise<void> {

    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(USER_PROFILE);

}