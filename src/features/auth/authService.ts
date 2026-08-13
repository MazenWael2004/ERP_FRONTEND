import i18n from "../../config/i18n";
import { api } from "../../shared/api/axios";
import type {
    LoginFormRequest,
    LoginFormResponse,
} from "./types";

export const loginApi = async (
    data: LoginFormRequest
): Promise<LoginFormResponse> => {

    const credentials = btoa(
        `${data.userName}:${data.password}`
    );

    // 1. Login
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

    const token = response.data.token;
    const user = response.data.data;

    // 2. Store authentication data
    localStorage.setItem("access", token);
    localStorage.setItem("user", JSON.stringify(user));

    // 3. Get user's permissions
    const permissionsResponse = await getUserPermissions(user.id);

    const permissions = permissionsResponse.data;

    // 4. Store permissions
    localStorage.setItem(
        "permissions",
        JSON.stringify(permissions)
    );

    // 5. Return everything together
    return {
        ...response.data,
        data: user,
        permissions,
    };
};


export const getUserPermissions = async (
    userId: number
) => {

    const response = await api.get(
        `/role_permissions/user/${userId}`
    );

    return response.data;
};