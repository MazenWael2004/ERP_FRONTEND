


export type PermissionMap = Record<number, any>;

export const buildPermissionMap = (
    permissions: any[]
): PermissionMap => {
    return permissions.reduce<PermissionMap>((acc, permission) => {
        const pageId = permission.page_id;

        if (!acc[pageId]) {
            acc[pageId] = {
                pageId,
                page: permission.title_en,
                actions: {},
            };
        }

        const action = permission.name_en[1]?.toLowerCase();

        if (action) {
            acc[pageId].actions[
                action as keyof["actions"]
            ] = true;
        }

        return acc;
    }, {});
};