export const rolesEnums = ['DEFAULT_USER', 'SUPER_ADMIN', 'VENDOR'] as const;

export type RoleType = (typeof rolesEnums)[number];
