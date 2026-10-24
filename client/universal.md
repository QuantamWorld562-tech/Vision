# Client — Universal Files Reference Catalog

This document lists all **universal** (domain-agnostic, generic UI, utility, type definitions, and application infrastructure) files within the `client/` area of the project.

---

## Quick Reference Summary

| File Name | Relative Path | Absolute Path | Category | Core Purpose |
|---|---|---|---|---|
| [`Loader.tsx`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/components/Loader.tsx) | `client/src/components/Loader.tsx` | `/Users/kunalyadav/Documents/Projects/Vision/client/src/components/Loader.tsx` | Reusable UI Component | Universal CSS-animated loading spinner used across any page or async action |
| [`constants.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/constants.ts) | `client/src/constants.ts` | `/Users/kunalyadav/Documents/Projects/Vision/client/src/constants.ts` | Configuration | Environment configuration constants (`serverUrl` with fallback logic) |
| [`firebase.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/utils/firebase.ts) | `client/src/utils/firebase.ts` | `/Users/kunalyadav/Documents/Projects/Vision/client/src/utils/firebase.ts` | Third-Party SDK Integration | Reusable Firebase Client App, Google Auth Provider, and Analytics instance |
| [`store.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/redux/store.ts) | `client/src/redux/store.ts` | `/Users/kunalyadav/Documents/Projects/Vision/client/src/redux/store.ts` | State Management | Central Redux Toolkit store setup and global `RootState` & `AppDispatch` types |
| [`index.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/types/index.ts) | `client/src/types/index.ts` | `/Users/kunalyadav/Documents/Projects/Vision/client/src/types/index.ts` | Type Contracts | Centralized domain and communication interfaces shared across all components |
| [`vite-env.d.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/vite-env.d.ts) | `client/src/vite-env.d.ts` | `/Users/kunalyadav/Documents/Projects/Vision/client/src/vite-env.d.ts` | TypeScript Shims | Ambient Vite client type declarations (`import.meta.env`, asset imports) |

---

## Detailed File Breakdown

### 1. `client/src/components/Loader.tsx`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/client/src/components/Loader.tsx`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/components/Loader.tsx)
- **Exports**: `default Loader`
- **Why It's Universal**:
  A pure, decoupled UI spinner component styled with Tailwind CSS. It has no dependencies on business state, domain models, or route context, making it reusable anywhere in the frontend for async operations, suspense fallbacks, or data fetching indicators.

### 2. `client/src/constants.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/client/src/constants.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/constants.ts)
- **Exports**: `serverUrl`
- **Why It's Universal**:
  Central source for frontend runtime configuration. Reads `import.meta.env.VITE_SERVER_URL` and safely falls back to local development URLs, preventing hardcoded endpoint strings in API calls.

### 3. `client/src/utils/firebase.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/client/src/utils/firebase.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/utils/firebase.ts)
- **Exports**: `auth`, `provider`, `analytics`
- **Why It's Universal**:
  Generic client-side authentication and analytics integration with Google Firebase. Provides a centralized, ready-to-use `GoogleAuthProvider` and `getAuth(app)` instance without coupling to specific page logic.

### 4. `client/src/redux/store.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/client/src/redux/store.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/redux/store.ts)
- **Exports**: `store`, `AppDispatch`, `RootState`
- **Why It's Universal**:
  Configures the central Redux store and derives the application-wide TypeScript types `RootState` and `AppDispatch`, which are used by all typed hooks (`useSelector`, `useDispatch`) across the client codebase.

### 5. `client/src/types/index.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/client/src/types/index.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/types/index.ts)
- **Exports**: `UserData`, `ChannelData`, `VideoData`, `ShortData`, `PlaylistData`, `PostData`, `CommentData`, `CommentReplyData`, `StudioAnalyticsData`, `HistoryItem`, etc.
- **Why It's Universal**:
  The central TypeScript interface definitions ensuring type safety across the entire client application, from Redux state to page components and API responses.

### 6. `client/src/vite-env.d.ts`
- **Path**: [`/Users/kunalyadav/Documents/Projects/Vision/client/src/vite-env.d.ts`](file:///Users/kunalyadav/Documents/Projects/Vision/client/src/vite-env.d.ts)
- **Exports**: Vite client reference (`/// <reference types="vite/client" />`)
- **Why It's Universal**:
  Global environment declarations providing TypeScript types for Vite features like CSS modules, image imports (`.png`, `.svg`, `.webp`), and `import.meta.env`.
