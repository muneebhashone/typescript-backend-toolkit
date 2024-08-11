import mongoose, { Document, Schema } from 'mongoose';
import {
  SocialAccountType,
  ROLE_ENUM,
  RoleType,
  SOCIAL_ACCOUNT_ENUM,
} from '../enums'; // Import rolesEnums
export interface ISocialAccountInfo {
  accountType: SocialAccountType;
  accessToken: string;
  tokenExpiry: Date;
  refreshToken?: string;
  accountID: string;
}
export interface IUser {
  email?: string;
  tempEmail?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  role: RoleType;
  dob?: Date | string;
  phoneNo?: string;
  tempPhoneNo?: string;
  isActive: boolean;
  password: string;
  passwordResetCode?: string;
  setPasswordCode?: string;
  otp?: string | null;
  loginOtp?: string;
  updateOtp?: string;
  country?: string;
  state?: string;
  city?: string;
  streetAddress?: string;
  postalCode?: string;
  interest?: string;
  fcmToken?: string;
  socialAccount?: ISocialAccountInfo[];
  updatedAt?: Date;
  createdAt?: Date;
}
const SocialAccountSchema = new Schema<ISocialAccountInfo>({
  accountType: {
    type: String,
    required: true,
    enum: Object.keys(SOCIAL_ACCOUNT_ENUM),
  },
  accessToken: { type: String, required: true },
  tokenExpiry: { type: Date },
  refreshToken: { type: String },
  accountID: { type: String, required: true },
});
// Define User schema
const UserSchema: Schema<IUser> = new Schema({
  email: { type: String },
  tempEmail: { type: String },
  avatar: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  role: {
    type: String,
    required: true,
    enum: Object.keys(ROLE_ENUM),
    default: ROLE_ENUM.DEFAULT_USER,
  },
  dob: { type: Date },
  phoneNo: { type: String },
  tempPhoneNo: { type: String },
  isActive: { type: Boolean, default: false },
  password: { type: String, required: true, select: false },
  passwordResetCode: { type: String },
  setPasswordCode: { type: String },
  otp: { type: String, select: false },
  loginOtp: { type: String, select: false },
  updateOtp: { type: String, select: false },
  country: { type: String },
  state: { type: String },
  city: { type: String },
  streetAddress: { type: String },
  postalCode: { type: String },
  updatedAt: { type: Date, default: () => new Date() },
  createdAt: { type: Date, default: () => new Date() },
  socialAccount: [{ type: SocialAccountSchema, required: false }],
  fcmToken: {
    type: String,
    required: false,
    default: null,
  },
});
export interface ISocialAccountDocument extends ISocialAccountInfo, Document {}
export interface IUserDocument extends IUser, Document {}
const User = mongoose.model<IUser>('User', UserSchema);
export default User;
