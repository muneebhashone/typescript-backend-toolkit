import config from '../config/env';

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

export interface GoogleAuthUrlParams {
  clientId: string;
  redirectUri: string;
  scope?: string;
  responseType?: string;
}

/**
 * Exchange Google OAuth authorization code for access tokens
 * @param params - Request parameters containing the authorization code
 * @returns Google token response with access and refresh tokens
 * @throws Error if Google credentials are not configured or token exchange fails
 */
export const fetchGoogleTokens = async (
  params: GoogleTokensRequestParams,
): Promise<GoogleTokenResponse> => {
  if (
    !config.GOOGLE_CLIENT_ID ||
    !config.GOOGLE_CLIENT_SECRET ||
    !config.GOOGLE_REDIRECT_URI
  ) {
    throw new Error('Google credentials are not set');
  }

  const url = 'https://oauth2.googleapis.com/token';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: params.code,
      client_id: config.GOOGLE_CLIENT_ID,
      client_secret: config.GOOGLE_CLIENT_SECRET,
      redirect_uri: config.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens');
  }

  const data: GoogleTokenResponse = await response.json();
  return data;
};

/**
 * Fetch Google user information using an access token
 * @param accessToken - Google OAuth access token
 * @returns Google user information
 * @throws Error if fetching user info fails
 */
export const getUserInfo = async (
  accessToken: string,
): Promise<GoogleUserInfo> => {
  const userInfoResponse = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!userInfoResponse.ok) {
    throw new Error('Error fetching user info');
  }

  return userInfoResponse.json();
};

export const generateGoogleAuthUrl = (params: GoogleAuthUrlParams) => {
  const googleURL = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleURL.searchParams.set('response_type', params.responseType ?? 'code');
  googleURL.searchParams.set('client_id', params.clientId);
  googleURL.searchParams.set('redirect_uri', params.redirectUri);
  googleURL.searchParams.set('scope', params.scope ?? 'email profile');

  return googleURL.toString();
}

