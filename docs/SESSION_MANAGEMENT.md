# Session Management Implementation

## Overview

Server-managed session lifecycle integrated with JWT-based authentication, supporting both MongoDB and Redis storage backends.

## Features

- ✅ Dual storage backend support (MongoDB and Redis)
- ✅ Configurable session TTL and per-user session limits
- ✅ Session revocation on logout, password reset, and password change
- ✅ Secure session token hashing (SHA-256)
- ✅ Session metadata tracking (user agent, IP address)
- ✅ Automatic session eviction when max limit is reached
- ✅ RESTful session management endpoints
- ✅ Integrated with existing JWT authentication flow

## Configuration

Add the following environment variables to your `.env` file:

```env
# Enable session management
SET_SESSION=true

# Session storage driver (mongo or redis)
SESSION_DRIVER=mongo

# Maximum number of sessions per user (default: 5)
SESSION_MAX_PER_USER=5

# Session expires in seconds (default: 86400 = 24 hours)
SESSION_EXPIRES_IN=86400

# Optional: Session idle TTL in seconds
SESSION_IDLE_TTL=3600

# Optional: Session absolute TTL in seconds
SESSION_ABSOLUTE_TTL=604800

# Enable session rotation on privilege changes
SESSION_ROTATION=false

# Session cookie name (default: session_id)
SESSION_COOKIE_NAME=session_id

# Enable debug logging for sessions
SESSION_DEBUG=false
```

## Architecture

### Storage Implementations

#### MongoDB Store
- Uses Mongoose model with TTL indexes for automatic expiration
- Stores sessions in `sessions` collection
- Indexed on `userId`, `expiresAt`, and `tokenHash`

#### Redis Store
- Uses JSON serialization with TTL-based expiration
- Keys pattern: `session:{sessionId}`
- Maintains sorted sets per user: `user_sessions:{userId}`

### Session Lifecycle

1. **Login**: Session created with JWT containing `sid` claim
2. **Request**: Middleware validates session against stored data
3. **Logout**: Session explicitly revoked
4. **Expiration**: Automatic cleanup via TTL (MongoDB) or Redis expiration
5. **Password Change**: All user sessions revoked

## API Endpoints

### List User Sessions
```
GET /auth/sessions
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "sessions": [
      {
        "sessionId": "uuid",
        "userId": "user_id",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastSeen": "2024-01-01T01:00:00.000Z",
        "expiresAt": "2024-01-02T00:00:00.000Z",
        "metadata": {
          "userAgent": "Mozilla/5.0...",
          "ipAddress": "192.168.1.1"
        }
      }
    ]
  }
}
```

### Revoke Specific Session
```
DELETE /auth/sessions/:sessionId
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "message": "Session revoked successfully"
}
```

### Revoke All Sessions
```
DELETE /auth/sessions
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "message": "All sessions revoked successfully"
}
```

## Usage

### Enable in Plugin

```typescript
import { authPlugin } from './plugins/auth';

app.use(authPlugin({
  session: {
    enabled: true,
    driver: 'mongo', // or 'redis'
    maxPerUser: 5,
    debug: false
  }
}));
```

### Access Session in Request Handler

```typescript
app.get('/protected', canAccess(), (req, res) => {
  const session = req.session; // SessionRecord | undefined
  const user = req.user; // JwtPayload
  
  res.json({
    userId: user.sub,
    sessionId: session?.sessionId,
    lastSeen: session?.lastSeen
  });
});
```

### Programmatic Session Management

```typescript
import { getSessionManager } from './modules/auth/session/session.manager';

const sessionManager = getSessionManager();

// Create session
const session = await sessionManager.createSession({
  userId: 'user_123',
  token: 'jwt_token',
  metadata: {
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.1'
  }
});

// Validate session
const validation = await sessionManager.validateSession(sessionId, token);
if (validation.isValid) {
  // Session is valid
}

// Revoke session
await sessionManager.revokeSession(sessionId);

// Revoke all user sessions
await sessionManager.revokeAllUserSessions(userId);

// List user sessions
const sessions = await sessionManager.listUserSessions(userId);
```

## Security Considerations

1. **Token Hashing**: Session tokens are hashed with SHA-256 before storage
2. **Session ID Generation**: Uses `crypto.randomUUID()` for secure random IDs
3. **Cookie Security**: 
   - `httpOnly` flag set to prevent XSS
   - `secure` flag enabled in production
   - `sameSite: lax` for CSRF protection
4. **Automatic Revocation**: Sessions revoked on password reset/change
5. **Session Limits**: Enforced per-user maximum to prevent resource exhaustion

## MongoDB Schema

```typescript
{
  _id: ObjectId,
  userId: String (indexed),
  tokenHash: String (unique),
  metadata: {
    userAgent?: String,
    ipAddress?: String,
    deviceType?: String,
    browser?: String,
    os?: String
  },
  lastSeen: Date,
  expiresAt: Date (TTL index),
  isRevoked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Redis Keys Structure

```
session:{sessionId}        -> JSON serialized SessionRecord
user_sessions:{userId}     -> Sorted set (score: createdAt timestamp)
```

## Performance

- **MongoDB**: TTL index handles automatic cleanup, efficient queries with compound indexes
- **Redis**: Native expiration, O(1) lookups, sorted sets for user session ordering
- **Session Validation**: Single database query per request when sessions enabled

## Observability

Session operations are logged with contextual information:

- Session creation: `{ sessionId, userId }`
- Session revocation: `{ sessionId }`
- Bulk revocation: `{ userId }`
- Session eviction: `{ userId, revokedSessionId }`

Enable debug logging with `SESSION_DEBUG=true` for detailed session lifecycle tracking.

## Migration Guide

### Enabling Sessions on Existing Deployment

1. Add session configuration to environment variables
2. Ensure MongoDB indexes are created (automatic on first session creation)
3. Rolling restart application servers
4. Monitor logs for session creation/validation

### Disabling Sessions

Set `SET_SESSION=false` or remove the environment variable. The system will fall back to stateless JWT authentication.

## Troubleshooting

### Sessions Not Being Created
- Verify `SET_SESSION=true` in environment
- Check auth plugin is properly registered
- Ensure database connection is established

### Sessions Not Being Validated
- Confirm JWT contains `sid` claim
- Verify session exists in database/redis
- Check session hasn't expired or been revoked

### Performance Issues
- Consider Redis for high-throughput scenarios
- Adjust `SESSION_MAX_PER_USER` to limit resource usage
- Enable connection pooling for database

## Future Enhancements

- Session rotation on privilege escalation
- Device fingerprinting for enhanced security
- Session activity tracking and analytics
- CLI commands for session inspection and management
- Configurable cleanup job scheduling
