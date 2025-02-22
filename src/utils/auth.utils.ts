import crypto from "node:crypto";
import argon2 from "argon2";
import { JsonWebTokenError, sign, verify } from "jsonwebtoken";
import config from "../config/config.service";
import type { RoleType } from "../enums";
import logger from "../lib/logger.service";

export interface GoogleTokenResponse {
	access_token: string;
	expires_in: number;
	id_token: string;
	refresh_token?: string;
	scope: string;
	token_type: string;
}

export interface GoogleTokensRequestParams {
	code: string;
}

export type JwtPayload = {
	sub: string;
	email?: string | null;
	phoneNo?: string | null;
	username: string;
	role: RoleType;
};

export type PasswordResetTokenPayload = {
	email: string;
	userId: string;
};

export type SetPasswordTokenPayload = {
	email: string;
	userId: string;
};

export const hashPassword = async (password: string): Promise<string> => {
	return argon2.hash(password);
};

export const compareHash = async (
	hashed: string,
	plainPassword: string,
): Promise<boolean> => {
	return argon2.verify(hashed, plainPassword);
};
export const signToken = async (payload: JwtPayload): Promise<string> => {
	return sign(payload, String(config.JWT_SECRET), {
		expiresIn: Number(config.JWT_EXPIRES_IN) * 1000,
	});
};

export const signPasswordResetToken = async (
	payload: PasswordResetTokenPayload,
) => {
	return sign(payload, String(config.JWT_SECRET), {
		expiresIn: config.PASSWORD_RESET_TOKEN_EXPIRES_IN * 1000,
	});
};

export const signSetPasswordToken = async (
	payload: SetPasswordTokenPayload,
) => {
	return sign(payload, String(config.JWT_SECRET), {
		expiresIn: config.SET_PASSWORD_TOKEN_EXPIRES_IN,
	});
};

export const verifyToken = async <
	T extends JwtPayload | PasswordResetTokenPayload | SetPasswordTokenPayload,
>(
	token: string,
): Promise<T> => {
	try {
		return verify(token, String(config.JWT_SECRET)) as T;
	} catch (err) {
		if (err instanceof Error) {
			throw new Error(err.message);
		}

		if (err instanceof JsonWebTokenError) {
			throw new Error(err.message);
		}

		logger.error("verifyToken", { err });
		throw err;
	}
};

export const generateRandomPassword = (length = 16): string => {
	return crypto.randomBytes(length).toString("hex");
};
export const fetchGoogleTokens = async (
	params: GoogleTokensRequestParams,
): Promise<GoogleTokenResponse> => {
	if (
		!config.GOOGLE_CLIENT_ID ||
		!config.GOOGLE_CLIENT_SECRET ||
		!config.GOOGLE_REDIRECT_URI
	) {
		throw new Error("Google credentials are not set");
	}

	const url = "https://oauth2.googleapis.com/token";
	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			code: params.code,
			client_id: config.GOOGLE_CLIENT_ID,
			client_secret: config.GOOGLE_CLIENT_SECRET,
			redirect_uri: config.GOOGLE_REDIRECT_URI,
			grant_type: "authorization_code",
		}),
	});

	if (!response.ok) {
		throw new Error("Failed to exchange code for tokens");
	}

	const data: GoogleTokenResponse = await response.json();
	return data;
};
export interface GoogleUserInfo {
	id: string;
	email: string;
	verified_email: boolean;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	locale: string;
}

export const getUserInfo = async (accessToken: string) => {
	const userInfoResponse = await fetch(
		"https://www.googleapis.com/oauth2/v2/userinfo",
		{
			headers: { Authorization: `Bearer ${accessToken}` },
		},
	);
	if (!userInfoResponse.ok) {
		throw new Error("Error fetching user info");
	}
	return userInfoResponse.json();
};

export const generateOTP = (length = 6): string => {
	return crypto.randomBytes(length).toString("hex").slice(0, length);
};
