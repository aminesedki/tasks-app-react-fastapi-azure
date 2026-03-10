import { type UserSearchResult } from "../../shared-types/users";
import { USERS_BASE_PATH } from "../../constants/users";
import api from "../axios";

export async function search_users_by_email(
    email?: string
): Promise<UserSearchResult[]> {
    const response = await api.get(`${USERS_BASE_PATH}/search`, {
        params: email ? { email } : {},
    });
    return response.data;
}