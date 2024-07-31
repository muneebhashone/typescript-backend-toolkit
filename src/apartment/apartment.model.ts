import mongoose, { Schema, Document } from 'mongoose';

export interface IApartment {
  name: string;
  coverPhotoUrl?: string;
  videoUrl?: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  photos: string[];
  checkIn: string;
  checkOut: string;
  propertyPrice: mongoose.Types.Decimal128;
  numberOfRooms: number;
  numberOfBathrooms: number;
  numberOfBedrooms: number;
  numberOfPets: number;
  numberOfPersonsAllowed: number;
  petHosting: mongoose.Types.Decimal128;
  totalRating?: number;
  ratingCount?: number;
  propertySize: number;
  propertySizeUnit: string;
  bookingType: mongoose.Types.ObjectId;
  businessId?: number;
  userId?: number;
  propertyType?: mongoose.Types.ObjectId;
  typeOfPlace?: mongoose.Types.ObjectId;
  cancellationPolicies?: mongoose.Types.ObjectId[];
  facilities?: mongoose.Types.ObjectId[];
  houseRules?: mongoose.Types.ObjectId[];
  discounts?: mongoose.Types.ObjectId[];
  updatedAt: Date;
  createdAt: Date;
}

export interface IBookingType {
  name: string;
  description?: string;
}

export interface ICancellationPolicy {
  policy: string;
  description?: string;
}

export interface IPropertyType {
  type: string;
}

export interface ITypeOfPlace {
  type: string;
}

export interface IFacility {
  name: string;
  icon?: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface IDiscount {
  title: string;
  description?: string;
  value: number;
}

export interface IHouseRule {
  rule: string;
}

export interface IApartmentDocument extends IApartment, Document {}
export interface IHouseRuleDocument extends IHouseRule, Document {}
export interface IDiscountDocument extends IDiscount, Document {}
export interface IFacilityDocument extends IFacility, Document {}
export interface ITypeOfPlaceDocument extends ITypeOfPlace, Document {}
export interface IPropertyTypeDocument extends IPropertyType, Document {}
export interface ICancellationPolicyDocument
  extends ICancellationPolicy,
    Document {}
export interface IBookingTypeDocument extends IBookingType, Document {}

const BookingTypeSchema = new Schema<IBookingType>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true },
);

const HouseRuleSchema = new Schema<IHouseRule>(
  {
    rule: { type: String, required: true },
  },
  { timestamps: true },
);

const DiscountSchema = new Schema<IDiscount>(
  {
    title: { type: String, required: true },
    description: { type: String },
    value: { type: Number, required: true },
  },
  { timestamps: true },
);

const TypeOfPlaceSchema = new Schema<ITypeOfPlace>(
  {
    type: { type: String, required: true },
  },
  { timestamps: true },
);

const PropertyTypeSchema = new Schema<IPropertyType>(
  {
    type: { type: String, required: true },
  },
  { timestamps: true },
);

const CancellationPolicySchema = new Schema<ICancellationPolicy>(
  {
    policy: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true },
);

const FacilitySchema = new Schema<IFacility>(
  {
    name: { type: String, required: true },
    icon: { type: String },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const ApartmentSchema = new Schema<IApartment>(
  {
    name: { type: String, required: true },
    coverPhotoUrl: { type: String },
    videoUrl: { type: String },
    description: { type: String },
    photos: [{ type: String }],
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    propertyPrice: { type: Schema.Types.Decimal128, required: true },
    numberOfRooms: { type: Number, required: true },
    numberOfBathrooms: { type: Number, required: true },
    numberOfBedrooms: { type: Number, required: true },
    numberOfPets: { type: Number, required: true },
    numberOfPersonsAllowed: { type: Number, required: true },
    petHosting: { type: Schema.Types.Decimal128, required: true },
    totalRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    propertySize: { type: Number, required: true },
    propertySizeUnit: { type: String, required: true },
    bookingType: {
      type: Schema.Types.ObjectId,
      ref: 'BookingType',
      required: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyType: { type: Schema.Types.ObjectId, ref: 'PropertyType' },
    typeOfPlace: { type: Schema.Types.ObjectId, ref: 'TypeOfPlace' },
    cancellationPolicies: [
      { type: Schema.Types.ObjectId, ref: 'CancellationPolicy', default: [] },
    ],
    facilities: [{ type: Schema.Types.ObjectId, ref: 'Facility', default: [] }],
    houseRules: [
      { type: Schema.Types.ObjectId, ref: 'HouseRule', default: [] },
    ],
    discounts: [{ type: Schema.Types.ObjectId, ref: 'Discount', default: [] }],
  },
  { timestamps: true },
);

export const Apartment = mongoose.model<IApartment>(
  'Apartment',
  ApartmentSchema,
);

export const BookingType = mongoose.model<IBookingType>(
  'BookingType',
  BookingTypeSchema,
);

export const CancellationPolicy = mongoose.model<ICancellationPolicy>(
  'CancellationPolicy',
  CancellationPolicySchema,
);

export const Facility = mongoose.model<IFacility>('Facility', FacilitySchema);

export const PropertyType = mongoose.model<IPropertyType>(
  'PropertyType',
  PropertyTypeSchema,
);

export const TypeOfPlace = mongoose.model<ITypeOfPlace>(
  'TypeOfPlace',
  TypeOfPlaceSchema,
);

export const Discount = mongoose.model<IDiscount>('Discount', DiscountSchema);

export const HouseRule = mongoose.model<IHouseRule>(
  'HouseRule',
  HouseRuleSchema,
);
