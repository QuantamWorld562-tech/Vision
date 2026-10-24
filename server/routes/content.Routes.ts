import express from "express";
import isAuthenticated, { optionalAuth } from "../middleware/isAuthenticated.ts";
import upload from "../middleware/multer.ts";

import {
  createVideo,
  getAllVideos,
  getVideoById,
  likeVideo,
  dislikeVideo,
} from "../controllers/video.Controller.ts";
import {
  createShort,
  getAllShorts,
  getShortById,
  likeShort,
} from "../controllers/short.Controller.ts";
import {
  createPlaylist,
  getChannelPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
} from "../controllers/playlist.Controller.ts";
import {
  createPost,
  getAllPosts,
  getChannelPosts,
  likePost,
  deletePost,
} from "../controllers/post.Controller.ts";
import {
  getCommentsForContent,
  addCommentForContent,
  addReplyToComment,
  toggleCommentLike,
  deleteComment,
} from "../controllers/comment.Controller.ts";
import { validate } from "../validators/validate.ts";
import {
  createVideoSchema,
  createShortSchema,
  createPlaylistSchema,
  addVideoToPlaylistSchema,
  createPostSchema,
  createCommentSchema,
  createReplySchema,
} from "../validators/schemas.ts";

const contentRouter = express.Router();

// ── Video routes ──────────────────────────────────────────────
contentRouter.post(
  "/create-video",
  isAuthenticated,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  validate(createVideoSchema),
  createVideo,
);
contentRouter.get("/videos", getAllVideos);
contentRouter.get("/video/:id", optionalAuth, getVideoById);
contentRouter.post("/video/:id/like", isAuthenticated, likeVideo);
contentRouter.post("/video/:id/dislike", isAuthenticated, dislikeVideo);
contentRouter.get("/video/:contentId/comments", getCommentsForContent("Video"));
contentRouter.post(
  "/video/:contentId/comment",
  isAuthenticated,
  validate(createCommentSchema),
  addCommentForContent("Video"),
);

// ── Short routes ──────────────────────────────────────────────
contentRouter.post(
  "/create-short",
  isAuthenticated,
  upload.single("shortUrl"),
  validate(createShortSchema),
  createShort,
);
contentRouter.get("/shorts", getAllShorts);
contentRouter.get("/short/:id", getShortById);
contentRouter.post("/short/:id/like", isAuthenticated, likeShort);
contentRouter.get("/short/:contentId/comments", getCommentsForContent("Short"));
contentRouter.post(
  "/short/:contentId/comment",
  isAuthenticated,
  validate(createCommentSchema),
  addCommentForContent("Short"),
);

// ── Playlist routes ───────────────────────────────────────────
contentRouter.post(
  "/create-playlist",
  isAuthenticated,
  validate(createPlaylistSchema),
  createPlaylist,
);
contentRouter.get("/playlists/:channelId", getChannelPlaylists);
contentRouter.get("/playlist/:id", getPlaylistById);
contentRouter.post(
  "/playlist/:id/add-video",
  isAuthenticated,
  validate(addVideoToPlaylistSchema),
  addVideoToPlaylist,
);
contentRouter.delete(
  "/playlist/:id/remove-video/:videoId",
  isAuthenticated,
  removeVideoFromPlaylist,
);
contentRouter.delete("/playlist/:id", isAuthenticated, deletePlaylist);

// ── Community Post routes ─────────────────────────────────────
contentRouter.post(
  "/create-post",
  isAuthenticated,
  upload.single("image"),
  validate(createPostSchema),
  createPost,
);
contentRouter.get("/posts", getAllPosts);
contentRouter.get("/posts/:channelId", getChannelPosts);
contentRouter.post("/post/:id/like", isAuthenticated, likePost);
contentRouter.get("/post/:contentId/comments", getCommentsForContent("Post"));
contentRouter.post(
  "/post/:contentId/comment",
  isAuthenticated,
  validate(createCommentSchema),
  addCommentForContent("Post"),
);
contentRouter.delete("/post/:id", isAuthenticated, deletePost);

// ── Shared Comment actions (replies, like, delete) ───────────
contentRouter.post(
  "/comment/:commentId/reply",
  isAuthenticated,
  validate(createReplySchema),
  addReplyToComment,
);
contentRouter.post("/comment/:commentId/like", isAuthenticated, toggleCommentLike);
contentRouter.delete("/comment/:commentId", isAuthenticated, deleteComment);

export default contentRouter;
