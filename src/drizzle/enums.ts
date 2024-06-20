export const permissionEnums = [
  'VIEW_SHIPMENT',
  'CREATE_SHIPMENT',
  'EDIT_SHIPMENT',
  'DELETE_SHIPMENT',
  'VIEW_USER',
  'CREATE_USER',
  'EDIT_USER',
  'DELETE_USER',
  'VIEW_DASHBOARD',
  'VIEW_COMPANY',
] as const;

export const rolesEnums = [
  'WHITE_LABEL_ADMIN',
  'WHITE_LABEL_SUB_ADMIN',
  'CLIENT_SUPER_USER',
  'CLIENT_USER',
  'SUPER_ADMIN',
  'SUB_ADMIN',
] as const;
export const statusEnums = ['REJECTED', 'APPROVED', 'REQUESTED'] as const;
export const trackWithEnums = ['CONTAINER_NUMBER', 'MBL_NUMBER'] as const;
export const SHIPMENT_PROGRESS_STATUSES = {
  IN_PROGRESS: 'IN_PROGRESS',
  FOUND: 'FOUND',
  NOT_FOUND: 'NOT_FOUND',
  QUEUED: 'QUEUED',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
} as const;

export type RoleType = (typeof rolesEnums)[number];
export type StatusType = (typeof statusEnums)[number];
export type PermissionsType = (typeof permissionEnums)[number];
export type TrackWithType = (typeof trackWithEnums)[number];
export type ShipmentProgressStatusType =
  keyof typeof SHIPMENT_PROGRESS_STATUSES;
