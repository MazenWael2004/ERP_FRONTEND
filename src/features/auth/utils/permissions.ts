export function buildPermissionMap(permissions:any) {

    const map = {};

    for (const permission of permissions) {

        const page = permission.route;
        const action = permission.action_code;

        if (!map[page]) {
            map[page] = {};
        }

        map[page][action] = true;
    }

    return map;
}