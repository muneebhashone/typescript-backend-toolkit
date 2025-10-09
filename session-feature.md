# Auth Session Management Plugin Plan

## Objectives
- Deliver server-managed session lifecycle integrated with existing auth workflows (login, logout, password changes) while keeping developer ergonomics high.
- Support MongoDB and Redis storage backends behind a single interface selectable via configuration or plugin options.
- Enforce configurable session TTL and per-user session limits throughout the authentication lifecycle.
- Implement everything in-house (no new third-party session packages) while reusing the toolkit’s existing infrastructure.

## Assumptions & Constraints
- Current JWT-based authentication remains; sessions will bind issued JWTs to server-side state via a `sid` claim.
- `mongoose` and `ioredis` are available; no additional runtime dependencies will be introduced.
- Environment schema already contains `SESSION_EXPIRES_IN`; new session-specific knobs will extend this configuration.
- Plugin system continues to orchestrate setup, so the session manager will be wired through the existing `authPlugin`.

## Architecture Overview
1. Session configuration object derived from env vars and plugin overrides with sane defaults.
2. Shared `SessionRecord`/`SessionMetadata` types and Zod schemas under `src/modules/auth/session`.
3. `SessionStore` interface exposing CRUD operations plus a factory that instantiates Mongo or Redis implementations.
4. `MongoSessionStore` backed by a new Mongoose model with TTL and user-scoped indexes.
5. `RedisSessionStore` powered by `ioredis`, using JSON blobs and per-user sorted sets to enforce limits.
6. `SessionManager` coordinating store operations, TTL enforcement, eviction policy, and developer-facing helpers.
7. Extended auth plugin that registers the manager on `app.locals`, exposes configuration, and hooks cleanup on shutdown.
8. Middleware and services updated so JWT extraction requires an active session before requests reach business logic.

## Implementation Steps
### 1. Configuration & Typings
- Extend `src/config/env.ts` with `SESSION_DRIVER`, `SESSION_MAX_PER_USER`, `SESSION_IDLE_TTL`, `SESSION_ABSOLUTE_TTL`, `SESSION_ROTATION`, `SESSION_COOKIE_NAME`, and optional `SESSION_DEBUG`.
- Update `modules.d.ts` (and any config typings) so new env vars are strongly typed.
- Document defaults in env templates and ensure `config.SET_SESSION` semantics remain backward compatible.

### 2. Session Domain Modeling
- Create `src/modules/auth/session/session.types.ts` defining `SessionRecord`, `SessionMetadata`, and `SessionValidationResult`.
- Add `session.schema.ts` with Zod schemas for session creation, validation, and plugin options.
- Introduce helper utilities (e.g., `generateSessionId`, `buildSessionCookieOptions`) under `session.utils.ts`.

### 3. Store Implementations
- Mongo: add `session.model.ts` with schema (`sessionId`, `userId`, hashed token, metadata, `expiresAt`, `lastSeen`) and TTL indexes; implement `mongo.session.store.ts`.
- Redis: add `redis.session.store.ts` storing sessions under `session:<id>` with expiry and maintaining `user_sessions:<userId>` sorted sets for ordering and eviction.
- Ensure both stores expose `create`, `get`, `listByUser`, `touch`, `revoke`, `revokeAllForUser`, `pruneExpired`, and share error semantics.

### 4. Session Manager & Plugin Wiring
- Implement `SessionManager` in `session.manager.ts` to wrap a store, normalize config, enforce max-session policies, and provide developer-friendly methods.
- Extend `authPlugin` options to accept session config overrides, instantiate `SessionManager`, set `app.locals.sessionManager`, and register `onShutdown` cleanup.
- Optionally expose lightweight factory (`getSessionManager(app)`) for other modules.

### 5. Auth Lifecycle Integration
- Update `loginUserByEmail` and Google login flows to create sessions after credential validation, embedding `sid` in JWT payloads and attaching secure cookies when `SET_SESSION` is true.
- Adjust logout handler to extract current session and revoke it before clearing cookies.
- Revoke all sessions on password reset/change to mitigate credential compromise.
- Add management endpoints (list/revoke sessions) within `auth.router.ts` guarded by authentication.

### 6. Middleware & Request Context
- Enhance `extract-jwt` middleware to require `sid`, verify session state, attach `req.session`, and short-circuit on invalid/expired sessions.
- Add guard middleware (`requireActiveSession`) for routes needing hard session enforcement.
- Update Express typings so `Request` includes optional `session: SessionRecord`.

### 7. Session Maintenance & Observability
- Rely on Mongo TTL indexes for pruning and add lazy pruning hooks for Redis (plus optional timed cleanup driven by config).
- Emit structured logs via existing logger for session issuance, eviction, revocation, and anomalies.
- Hook into observability plugin to expose counters/gauges (active sessions per user, revocations, evictions) when metrics are enabled.

### 8. Testing & Validation
- Write unit tests (using `node:test` or existing setup) for `SessionManager`, Mongo store (with in-memory Mongo or mocks), and Redis store (with mock client).
- Add integration tests covering login/session issuance, max-session eviction, logout revocation, and request rejection when sessions are revoked or expired.
- Include regression tests for password reset flows to ensure sessions are properly purged.

## Security & Risk Considerations
- Hash session tokens (e.g., SHA-256) before persistence to protect against data leaks.
- Generate session IDs with `crypto.randomUUID` or secure random bytes; avoid sequential IDs.
- Rotate session IDs on privilege changes when `SESSION_ROTATION` is enabled.
- Ensure cookies remain `httpOnly`, `secure` in production, and `sameSite` aligned with existing `COOKIE_CONFIG`.
- Fail closed if the store is unavailable; surface actionable logs and metrics for operators.

## Developer Experience & Documentation
- Update docs with configuration reference, code samples (`req.session`, revoking sessions), and Mongo vs Redis trade-offs.
- Provide quick-start snippets showing how to enable the plugin in custom app setups.
- Optionally add helper CLI commands under `bin/tbk` for inspecting or clearing sessions during development.
- Note migration steps for existing deployments (new env vars, database indexes, rolling restart considerations).

## Rollout & Follow-up
- Deliver in stages: default to Mongo driver first, then enable Redis once verified.
- Provide migration script or documentation to create Mongo indexes and clear legacy session data where applicable.
- Monitor logs/metrics post-merge, gather developer feedback on ergonomics, and iterate on defaults or DX improvements.
