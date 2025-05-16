# Google Authentication Implementation Guide

This document explains how to implement Google authentication in the Typescript Backend Toolkit using Google Identity Services.

## Overview

The implementation uses Google's newer Identity Services API, which provides a more secure and user-friendly authentication experience compared to the older OAuth 2.0 redirect flow. The key differences are:

| Feature              | Google Identity Services (New)    | OAuth 2.0 Redirect Flow (Old)  |
| -------------------- | --------------------------------- | ------------------------------ |
| User Experience      | One-tap sign-in, popup-based flow | Full page redirects            |
| Security             | JWT-based ID tokens               | Authorization code flow        |
| Implementation       | Client-side token generation      | Server-side code exchange      |
| Session Disruption   | Minimal - stays on same page      | High - navigates away from app |
| Cross-device Support | Better mobile/desktop integration | Requires more custom handling  |

## Prerequisites

1. A Google Cloud Platform account
2. A configured OAuth 2.0 Client ID
3. Proper configuration of authorized JavaScript origins and redirect URIs

## Environment Variables

Add these variables to your `.env` file:

```
GOOGLE_CLIENT_ID=your-client-id-here
```

## Implementation Steps

### 1. Frontend Implementation

The frontend implementation uses Google's Identity Services library to handle the authentication flow:

```html
<!-- Include the Google Identity Services library -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<!-- Configure the Google Sign-In button -->
<div
  id="g_id_onload"
  data-client_id="YOUR_CLIENT_ID"
  data-context="signin"
  data-ux_mode="popup"
  data-callback="handleCredentialResponse"
  data-auto_prompt="false"
></div>

<!-- Render the Google Sign-In button -->
<div
  class="g_id_signin"
  data-type="standard"
  data-shape="rectangular"
  data-theme="outline"
  data-text="signin_with"
  data-size="large"
  data-logo_alignment="left"
></div>

<script>
  function handleCredentialResponse(response) {
    // Get the ID token from the response
    const idToken = response.credential;

    // Send the ID token to your backend
    fetch('/api/auth/google/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Store the authentication token
        if (data.data && data.data.token) {
          localStorage.setItem('_auth_token_', data.data.token);
        }
      });
  }
</script>
```

## Security Considerations

1. **Token Validation**: Always verify the ID token on your server using Google's libraries.
2. **Email Verification**: Check that the email is verified (`email_verified` claim).
3. **Expiration Time**: Verify the token hasn't expired (`exp` claim).
4. **HTTPS**: Always use HTTPS for token transmission.

## Troubleshooting

### Common Issues

1. **Invalid Client ID**: Ensure your client ID is correctly configured in both frontend and backend.
2. **CORS Issues**: Make sure your domain is listed in the authorized JavaScript origins.
3. **Token Verification Failures**: Check that your server time is synchronized.
4. **Missing Scopes**: Ensure you're requesting the necessary scopes (email, profile).

## References

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [Google OAuth 2.0 for Client-side Web Applications](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
- [Verifying Google ID Tokens](https://developers.google.com/identity/sign-in/web/backend-auth)
