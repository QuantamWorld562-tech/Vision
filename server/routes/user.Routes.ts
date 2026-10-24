import express from "express";
import isAuthenticated, { optionalAuth } from "../middleware/isAuthenticated.ts";
import {
  createChannel,
  getChannelData,
  getCurrentUser,
  updateChannel,
  toggleSubscribe,
  getSubscriptions,
  getLikedVideos,
  toggleSaveVideo,
  getSavedVideos,
  toggleSavePlaylist,
  getSavedPlaylists,
  addToHistory,
  getHistory,
  clearHistory,
  aiSearch,
  getVideosByCategory,
  getRecommendations,
  getStudioAnalytics,
  updateVideoMeta,
  deleteVideo,
} from "../controllers/user.controller.ts";
import upload from "../middleware/multer.ts";
import { validate, validateQuery } from "../validators/validate.ts";
import {
  createChannelSchema,
  updateChannelSchema,
  updateVideoSchema,
  searchQuerySchema,
  recommendationQuerySchema,
  paginationQuerySchema,
} from "../validators/schemas.ts";

const userRouter = express.Router();

// ── Core user ──────────────────────────────────────────────────
userRouter.get("/", optionalAuth, getCurrentUser);

// ── Channel ────────────────────────────────────────────────────
userRouter.post(
  "/createchannel",
  isAuthenticated,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  validate(createChannelSchema),
  createChannel,
);
userRouter.get("/channel", isAuthenticated, getChannelData);
userRouter.put(
  "/updatechannel",
  isAuthenticated,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  validate(updateChannelSchema),
  updateChannel,
);

// ── Subscriptions ──────────────────────────────────────────────
userRouter.post("/subscribe/:channelId", isAuthenticated, toggleSubscribe);
userRouter.get("/subscriptions", isAuthenticated, getSubscriptions);

// ── Liked content ──────────────────────────────────────────────
userRouter.get("/liked-videos", isAuthenticated, getLikedVideos);

// ── Saved videos ───────────────────────────────────────────────
userRouter.post("/save-video/:videoId", isAuthenticated, toggleSaveVideo);
userRouter.get("/saved-videos", isAuthenticated, getSavedVideos);

// ── Saved playlists ────────────────────────────────────────────
userRouter.post("/save-playlist/:playlistId", isAuthenticated, toggleSavePlaylist);
userRouter.get("/saved-playlists", isAuthenticated, getSavedPlaylists);

// ── History ────────────────────────────────────────────────────
userRouter.post("/history/:videoId", isAuthenticated, addToHistory);
userRouter.get("/history", isAuthenticated, getHistory);
userRouter.delete("/history", isAuthenticated, clearHistory);

// ── AI Search ──────────────────────────────────────────────────
userRouter.get("/search", validateQuery(searchQuerySchema), aiSearch);

// ── AI Category Filter ─────────────────────────────────────────
userRouter.get("/category", validateQuery(paginationQuerySchema), getVideosByCategory);

// ── Recommendations ────────────────────────────────────────────
userRouter.get("/recommendations", validateQuery(recommendationQuerySchema), getRecommendations);

// ── PT Studio Analytics ────────────────────────────────────────
userRouter.get("/studio/analytics", isAuthenticated, getStudioAnalytics);

// ── Content management (update/delete) ────────────────────────
userRouter.put(
  "/video/:id",
  isAuthenticated,
  upload.single("thumbnail"),
  validate(updateVideoSchema),
  updateVideoMeta,
);
userRouter.delete("/video/:id", isAuthenticated, deleteVideo);

export default userRouter;
