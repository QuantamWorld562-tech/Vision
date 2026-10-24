# Server — Universal Files Reference Catalog

This document lists all **universal** (domain-agnostic, generic, and reusable infrastructure, middleware, utility, and configuration) files within the `server/` area of the project.

---

## Quick Reference Summary

| File Name | Relative Path | Absolute Path | Category | Core Purpose |
|---|---|---|---|---|
| [`validate.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/validators/validate.ts) | `server/validators/validate.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/validators/validate.ts` | Validation Middleware | Generic Express middleware validating any request body, query, or params via Zod |
| [`schemas.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/validators/schemas.ts) *(Universal Blocks)* | `server/validators/schemas.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/validators/schemas.ts` | Validation Schemas | Universal building blocks: MongoDB `objectIdSchema` and cursor `paginationQuerySchema` |
| [`multer.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/middleware/multer.ts) | `server/middleware/multer.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/middleware/multer.ts` | File Upload Middleware | Multipart file upload handler with disk storage and generic MIME type filtering |
| [`isAuthenticated.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/middleware/isAuthenticated.ts) | `server/middleware/isAuthenticated.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/middleware/isAuthenticated.ts` | Auth Middleware | Universal JWT verification middleware (`isAuthenticated`, `optionalAuth`) |
| [`rateLimit.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/middleware/rateLimit.ts) | `server/middleware/rateLimit.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/middleware/rateLimit.ts` | Security Middleware | Configurable sliding window request rate-limiting with test mode pass-through |
| [`env.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/config/env.ts) | `server/config/env.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/config/env.ts` | Configuration | Type-safe environment variable parsing, validation, and defaults via Zod |
| [`db.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/config/db.ts) | `server/config/db.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/config/db.ts` | Database Config | Reusable MongoDB Mongoose connection manager with connection timeout and fallback |
| [`cloudinary.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/config/cloudinary.ts) | `server/config/cloudinary.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/config/cloudinary.ts` | Storage Utility | Generic Cloudinary asset uploader with automated disk cleanup and test mock |
| [`sendMail.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/config/sendMail.ts) | `server/config/sendMail.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/config/sendMail.ts` | Email Utility | Reusable Nodemailer transporter for dispatching emails and OTP tokens |
| [`express.d.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/types/express.d.ts) | `server/types/express.d.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/types/express.d.ts` | Type Declarations | Universal Express ambient typing extension attaching `req.id` |
| [`env.d.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/types/env.d.ts) | `server/types/env.d.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/types/env.d.ts` | Type Declarations | Global Node `ProcessEnv` interface typing |

---

## Detailed File Breakdown

### 1. `server/validators/validate.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/server/validators/validate.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/validators/validate.ts)
- **Exports**: `validate`, `validateQuery`, `validateParams`
- **Why It's Universal**:
  Accepts any arbitrary Zod schema and generates standard Express middlewares for validating `req.body`, `req.query`, and `req.params`. When validation fails, it formats issues into standard HTTP 400 JSON responses. Can be plugged into any route in any Express application without modifications.

### 2. `server/validators/schemas.ts` (Universal Building Blocks)
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/server/validators/schemas.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/validators/schemas.ts#L4-L16)
- **Exports**: `objectIdSchema`, `paginationQuerySchema`
- **Why It's Universal**:
  - `objectIdSchema`: Verifies any 24-character hexadecimal MongoDB ObjectId string across any entity.
  - `paginationQuerySchema`: Generic cursor pagination parameters (`cursor`, `limit`, `category`) applicable to any paginated collection.

### 4. `server/middleware/multer.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/server/middleware/multer.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/middleware/multer.ts)
- **Exports**: `default upload`
- **Why It's Universal**:
  A general-purpose multipart file upload handler using disk storage. Creates the upload folder recursively and enforces MIME type verification across standard image formats (JPEG, PNG, WebP, GIF) and video formats (MP4, WebM, MKV, QuickTime).

### 5. `server/middleware/isAuthenticated.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/server/middleware/isAuthenticated.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/middleware/isAuthenticated.ts)
- **Exports**: `default isAuthenticated`, `optionalAuth`
- **Why It's Universal**:
  Universal JWT token authentication guards. Checks both `req.cookies.token` and `Authorization: Bearer <token>` headers, verifies the signature against `SECRET_KEY`, and decorates `req.id` for downstream handlers.

### 6. `server/middleware/rateLimit.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/server/middleware/rateLimit.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/middleware/rateLimit.ts)
- **Exports**: `authLimiter`, `otpLimiter`
- **Why It's Universal**:
  Express rate limiters equipped with automated test-environment pass-through (`isTest`), preventing CI test execution from hitting rate limits while enforcing DDoS protection in staging and production.

### 7. `server/config/env.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/server/config/env.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/config/env.ts)
- **Exports**: `env`, `default env`
- **Why It's Universal**:
  Validates system environment variables at bootstrap time using Zod, providing sane defaults and formatted terminal warning logs when mandatory variables are absent.

### 8. `server/config/db.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/server/config/db.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/config/db.ts)
- **Exports**: `default connectDb`
- **Why It's Universal**:
  Reusable Mongoose database connection lifecycle manager. Configures server selection timeouts, graceful degradation when `MONGO_URI` is absent, and triggers schema index builds.

### 9. `server/config/cloudinary.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/server/config/cloudinary.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/config/cloudinary.ts)
- **Exports**: `default uploadOnCloudinary`
- **Why It's Universal**:
  Abstracted cloud file upload pipeline that consumes a local file path, sends it to Cloudinary with `resource_type: "auto"`, cleans up temporary files from disk upon completion, and provides zero-network mocks during test execution.

### 10. `server/config/sendMail.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/server/config/sendMail.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/config/sendMail.ts)
- **Exports**: `default sendMail`
- **Why It's Universal**:
  Nodemailer SMTP integration for delivering transactional security emails, OTPs, and notification messages.

### 11. `server/types/express.d.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/server/types/express.d.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/types/express.d.ts)
- **Exports**: Global declaration for `Express.Request`
- **Why It's Universal**:
  TypeScript ambient module extension that safely injects the generic `id?: string` property into Express's native `Request` interface.

### 12. `server/types/env.d.ts`
- **Path**:
  - [`/Users/kunalyadav/Documents/Projects/Vision/server/types/env.d.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/types/env.d.ts)
- **Why It's Universal**:
  Provides global type definitions for `NodeJS.ProcessEnv` across all server runtime files.
