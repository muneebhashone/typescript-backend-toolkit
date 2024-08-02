import mongoose, { Document, Schema } from 'mongoose';
import { ISocialAccountType, rolesEnums } from '../enums'; // Import rolesEnums
export interface ISocialAccountInfo {
  accountType: ISocialAccountType;
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
  role: string;
  dob?: Date;
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
  business?: string;
  postalCode?: string;
  updatedAt?: Date;
  createdAt?: Date;
  accountName?: string;
  bankName?: string;
  accountNumber?: string;
  interest?: string;
  socialAccount?: ISocialAccountInfo;
}
const SocialAccountSchema = new Schema<ISocialAccountInfo>({
  accountType: {
    type: String,
    required: true,
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
    enum: rolesEnums,
    default: rolesEnums[0],
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
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: false,
  },
  postalCode: { type: String },
  updatedAt: { type: Date, default: () => new Date() },
  createdAt: { type: Date, default: () => new Date() },
  accountName: { type: String },
  bankName: { type: String },
  accountNumber: { type: String },
  interest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: false,
  },
  socialAccount: { type: SocialAccountSchema, required: false },
});
export interface ISocialAccountDocument extends ISocialAccountInfo, Document {}
export interface IUserDocument extends IUser, Document {}
const User = mongoose.model<IUser>('User', UserSchema);
export default User;
