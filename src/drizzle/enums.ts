export const rolesEnums = [
  'WHITE_LABEL_ADMIN',
  'WHITE_LABEL_SUB_ADMIN',
  'CLIENT_SUPER_USER',
  'CLIENT_USER',
  'SUPER_ADMIN',
  'SUB_ADMIN',
] as const;

export type RoleType = (typeof rolesEnums)[number];
