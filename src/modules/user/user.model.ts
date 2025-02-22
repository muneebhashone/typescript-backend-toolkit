import mongoose, { type Document, Schema } from "mongoose";
import { ROLE_ENUM, SOCIAL_ACCOUNT_ENUM } from "../../enums"; // Import rolesEnums
import type {
	SocialAccountInfoType,
	UserModelType,
	UserType,
} from "./user.dto";

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

const UserSchema: Schema<UserType> = new Schema(
	{
		email: { type: String, unique: true, required: true },
		avatar: { type: String },
		username: { type: String, required: true, unique: true },
		name: { type: String },
		otp: { type: String },
		role: {
			type: String,
			required: true,
			enum: Object.keys(ROLE_ENUM),
			default: ROLE_ENUM.DEFAULT_USER,
		},
		password: { type: String, required: true, select: false },
		passwordResetCode: { type: String },
		socialAccount: [{ type: SocialAccountSchema, required: false }],
	},
	{ timestamps: true },
);

export interface ISocialAccountDocument
	extends SocialAccountInfoType,
		Document {}
export interface IUserDocument extends Document<string>, UserModelType {}
const User = mongoose.model<UserType>("User", UserSchema);
export default User;
