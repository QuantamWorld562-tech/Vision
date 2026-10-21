# Vision — Master Universal Files Directory

This master document indexes all **universal** (domain-agnostic, generic infrastructure, middleware, utilities, types, and configurations) files across both the **client** and **server** areas of the project.

---

## 🖥️ Server Area Universal Files ([`server/universal.md`](file:///Users/kunalyadav/Documents/Projects/Vision/server/universal.md))

| File Name | Relative Path | Absolute Path | Purpose / Category |
|---|---|---|---|
| [`validate.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/validators/validate.ts) | `server/validators/validate.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/validators/validate.ts` | Generic Express Zod middleware (`validate`, `validateQuery`, `validateParams`) |
| [`requestValidator.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/validators/requestValidator.ts) | `server/validators/requestValidator.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/validators/requestValidator.ts` | Validation runners, error mappers, email, password, and string validators |
| [`schemas.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/validators/schemas.ts) *(Building Blocks)* | `server/validators/schemas.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/validators/schemas.ts` | MongoDB `objectIdSchema` and cursor `paginationQuerySchema` |
| [`multer.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/middleware/multer.ts) | `server/middleware/multer.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/middleware/multer.ts` | Generic multipart disk-storage upload middleware with image/video MIME filtering |
| [`isAuthenticated.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/middleware/isAuthenticated.ts) | `server/middleware/isAuthenticated.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/middleware/isAuthenticated.ts` | Universal JWT auth verification and optional guest auth middleware |
| [`rateLimit.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/middleware/rateLimit.ts) | `server/middleware/rateLimit.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/middleware/rateLimit.ts` | Sliding-window Express rate limiters with automated test bypass |
| [`env.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/config/env.ts) | `server/config/env.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/config/env.ts` | Centralized Zod schema validation for environment variables |
| [`db.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/config/db.ts) | `server/config/db.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/config/db.ts` | Reusable MongoDB Mongoose connection manager with index synchronization |
| [`cloudinary.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/config/cloudinary.ts) | `server/config/cloudinary.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/config/cloudinary.ts` | Generic cloud asset uploader with automated disk cleanup and test mock |
| [`sendMail.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/config/sendMail.ts) | `server/config/sendMail.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/config/sendMail.ts` | Nodemailer SMTP email dispatcher for OTP and transactional emails |
| [`express.d.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/types/express.d.ts) | `server/types/express.d.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/types/express.d.ts` | Ambient Express typing extension injecting `req.id` |
| [`module-shims.d.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/types/module-shims.d.ts) | `server/types/module-shims.d.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/types/module-shims.d.ts` | Ambient module declarations for untyped npm packages |
| [`env.d.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/server/types/env.d.ts) | `server/types/env.d.ts` | `/Users/kunalyadav/Documents/Projects/Vision/server/types/env.d.ts` | Ambient typing for `NodeJS.ProcessEnv` |

---

## 💻 Client Area Universal Files ([`client/universal.md`](file:///Users/kunalyadav/Documents/Projects/Vision/client/universal.md))

| File Name | Relative Path | Absolute Path | Purpose / Category |
|---|---|---|---|
| [`Loader.tsx`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/components/Loader.tsx) | `client/src/components/Loader.tsx` | `/Users/kunalyadav/Documents/Projects/Vision/client/src/components/Loader.tsx` | Pure Tailwind animated loading spinner component |
| [`constants.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/constants.ts) | `client/src/constants.ts` | `/Users/kunalyadav/Documents/Projects/Vision/client/src/constants.ts` | Frontend environment constants (`serverUrl` with fallback logic) |
| [`firebase.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/utils/firebase.ts) | `client/src/utils/firebase.ts` | `/Users/kunalyadav/Documents/Projects/Vision/client/src/utils/firebase.ts` | Firebase Client App, Google Auth Provider, and Analytics instance |
| [`store.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/redux/store.ts) | `client/src/redux/store.ts` | `/Users/kunalyadav/Documents/Projects/Vision/client/src/redux/store.ts` | Central Redux Toolkit store and exported `RootState` & `AppDispatch` types |
| [`index.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/types/index.ts) | `client/src/types/index.ts` | `/Users/kunalyadav/Documents/Projects/Vision/client/src/types/index.ts` | Central shared TypeScript interfaces across the frontend |
| [`vite-env.d.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/vite-env.d.ts) | `client/src/vite-env.d.ts` | `/Users/kunalyadav/Documents/Projects/Vision/client/src/vite-env.d.ts` | Ambient Vite environment and asset typing shims |

---

## Dedicated Area Files
For in-depth explanations, exports, and architectural rationales for each area, refer directly to:
- 📂 **Server Catalog**: [`server/universal.md`](file:///Users/kunalyadav/Documents/Projects/Vision/server/universal.md)
- 📂 **Client Catalog**: [`client/universal.md`](file:///Users/kunalyadav/Documents/Projects/Vision/client/universal.md)
