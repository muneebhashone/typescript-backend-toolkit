import mongoose from 'mongoose';

export const TypesOfVehicle = {
  car: 'car',
  suv: 'suv',
  truck: 'truck',
  party_van: 'party_van',
} as const;

export const CarSubCategory = {
  chauffeur: 'chauffeur',
  chauffeur_bodyguard: 'chauffeur_bodyguard',
  self_drive: 'self_drive',
} as const;

export const CarFacilities = {
  keyless_entry: 'keyless_entry',
  heated_seat: 'heated_seat',
  rear_camera: 'rear_camera',
  aux_input: 'aux_input',
  gps: 'gps',
  pet_friendly: 'pet_friendly',
  usb_charger: 'usb_charger',
  bluetooth: 'bluetooth',
} as const;

export const CarCancellationPolicies = {
  no_cancellation: 'no_cancellation',
  free_cancellation: 'free_cancellation',
  flexible: 'flexible',
  moderate: 'moderate',
} as const;

export const CarTransmissions = {
  manual: 'manual',
  automatic: 'automatic',
} as const;

export type TypesOfVehicleUnion = keyof typeof TypesOfVehicle;
export type CarSubCategoryUnion = keyof typeof CarSubCategory;
export type CarFacilitiesUnion = keyof typeof CarFacilities;
export type CarDiscountsUnion = keyof typeof CarDiscounts;
export type CarCancellationPoliciesUnion = keyof typeof CarCancellationPolicies;
export type CarTransmissionsUnion = keyof typeof CarTransmissions;

export interface CarDiscountType {
  type: 'percentage' | 'flat';
  value: number;
  description: string;
  title: string;
}

export interface CarCancellationPolicyType {
  name: string;
  description: string;
  type: CarCancellationPoliciesUnion;
}

export const CarDiscounts = {
  weekly_discount: {
    title: 'Weekly Discount',
    description: 'For booking more than 7 days',
    type: 'percentage',
    value: 9,
  },
  monthly_discount: {
    title: 'Monthly Discount',
    description: 'For booking more than 30 days',
    type: 'percentage',
    value: 15,
  },
} as const satisfies Record<string, CarDiscountType>;

export const CarCancellationPolicy = {
  no_cancellation: {
    type: 'no_cancellation',
    name: 'No Cancellation Policy',
    description: 'Free cancellation for 48 hours',
  },
  flexible: {
    type: 'flexible',
    name: 'Flexible Or Non-Refundable',
    description:
      'In addition to Flexible, offer a non-refundable option-guests pay 10% less, but you keep your payout no matter when they cancel.',
  },
  free_cancellation: {
    type: 'free_cancellation',
    name: 'Free Cancellation',
    description: 'Free cancellation for 48 hours.',
  },
  moderate: {
    type: 'moderate',
    name: 'Moderate',
    description: 'Full refund 5 days prior to arrival.',
  },
} as const satisfies Record<
  CarCancellationPoliciesUnion,
  CarCancellationPolicyType
>;

export interface ICarLocation {
  country: string;
  state: string;
  city: string;
  street: string;
  postalCode: string;
}

// export interface ICarChauffeur {
//   name: string;
//   phoneNumber: string;
//   perDayPrice: number;
// }

export interface ICar {
  name: string;
  typeOfVehicle: TypesOfVehicleUnion;
  make: string;
  model: string;
  noOfSeats: number;
  noOfLuggage: number;
  underReview: boolean;
  transmission: string;
  perDayPrice: number;
  description: string;
  location: ICarLocation;
  chauffeurId: mongoose.Types.ObjectId;
  subCategory: CarSubCategoryUnion;
  facilities: CarFacilitiesUnion[];
  coverPhoto: string;
  photos: string;
  video?: string;
  userId: mongoose.Schema.Types.ObjectId;
  discounts?: CarDiscountsUnion[];
  cancellationPolicies?: CarCancellationPoliciesUnion[];
  isOnBreak?: boolean;
  breakFrom?: Date | null;
  breakTill?: Date | null;
  reasonForBreak?: string;
}
