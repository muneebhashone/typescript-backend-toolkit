import mongoose, { Document, Schema } from 'mongoose';
import { ROLE_ENUM, SOCIAL_ACCOUNT_ENUM } from '../enums'; // Import rolesEnums
import { SocialAccountInfoType, UserType } from './user.dto';

const SocialAccountSchema = new Schema<SocialAccountInfoType>({
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
const UserSchema: Schema<UserType> = new Schema({
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

export interface ISocialAccountDocument
  extends SocialAccountInfoType,
    Document {}
export interface IUserDocument extends UserType, Document {}
const User = mongoose.model<UserType>('User', UserSchema);
export default User;
