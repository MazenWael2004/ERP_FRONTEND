import i18n from "../../config/i18n";
import { api } from "../../shared/api/axios";
import type {
    LoginFormRequest,
    LoginFormResponse
} from "./types";

export const loginApi = async (
    data: LoginFormRequest
): Promise<LoginFormResponse> => {

    const credentials = btoa(
        `${data.userName}:${data.password}`
    );

    const response = await api.post(
        "/auth/login",
        {},
        {
            headers: {
                Authorization: `Basic ${credentials}`,
                "Accept-Language": i18n.language,
            },
        }
    );

    localStorage.setItem(
        "access",
        response.data.token
    );

    localStorage.setItem(
        "user",
        JSON.stringify(response.data.data)
    );

    return response.data;
};

export const getUserPermissions = async (
    userId: number
) => {

    const response = await api.get(
        `/role_permissions/user/${userId}`
    );

    return response.data;
};