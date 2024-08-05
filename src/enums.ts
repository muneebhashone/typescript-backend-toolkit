export const rolesEnums = ['DEFAULT_USER', 'SUPER_ADMIN', 'VENDOR'] as const;
export const discountEnums = ['flat', 'percentage'] as const;
export const SOCIAL_ACCOUNTS = ['GOOGLE', 'FACEBOOK', 'APPLE'] as const;
export const cancellationPoliciesEnums = [
  'NO_CANCELLATION',
  'FREE_CANCELLATION',
  'FLEXIBLE_OR_NON_REFUNDABLE',
  'MODERATE',
] as const;

export type ISocialAccountType = (typeof SOCIAL_ACCOUNTS)[number];
export type RoleType = (typeof rolesEnums)[number];
export type CancellationPolicyType = (typeof cancellationPoliciesEnums)[number];
export type DiscountType = (typeof discountEnums)[number];
