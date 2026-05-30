import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../middleware/multer.js";

import { createVideo, getAllVideos, getVideoById, likeVideo, dislikeVideo, addComment } from "../controllers/video.Controller.js";
import { createShort, getAllShorts, getShortById, likeShort } from "../controllers/short.Controller.js";
import { createPlaylist, getChannelPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist } from "../controllers/playlist.Controller.js";
import { createPost, getAllPosts, getChannelPosts, likePost, addCommentToPost, deletePost } from "../controllers/post.Controller.js";

const contenRouter = express.Router();

// ── Video routes ──────────────────────────────────────────────
contenRouter.post(
  "/create-video",
  isAuthenticated,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createVideo,
);
contenRouter.get("/videos", getAllVideos);
contenRouter.get("/video/:id", getVideoById);
contenRouter.post("/video/:id/like", isAuthenticated, likeVideo);
contenRouter.post("/video/:id/dislike", isAuthenticated, dislikeVideo);
contenRouter.post("/video/:id/comment", isAuthenticated, addComment);

// ── Short routes ──────────────────────────────────────────────
contenRouter.post(
  "/create-short",
  isAuthenticated,
  upload.single("shortUrl"),
  createShort,
);
contenRouter.get("/shorts", getAllShorts);
contenRouter.get("/short/:id", getShortById);
contenRouter.post("/short/:id/like", isAuthenticated, likeShort);

// ── Playlist routes ───────────────────────────────────────────
contenRouter.post("/create-playlist", isAuthenticated, createPlaylist);
contenRouter.get("/playlists/:channelId", getChannelPlaylists);
contenRouter.get("/playlist/:id", getPlaylistById);
contenRouter.post("/playlist/:id/add-video", isAuthenticated, addVideoToPlaylist);
contenRouter.delete("/playlist/:id/remove-video/:videoId", isAuthenticated, removeVideoFromPlaylist);
contenRouter.delete("/playlist/:id", isAuthenticated, deletePlaylist);

// ── Community Post routes ─────────────────────────────────────
contenRouter.post(
  "/create-post",
  isAuthenticated,
  upload.single("image"),
  createPost,
);
contenRouter.get("/posts", getAllPosts);
contenRouter.get("/posts/:channelId", getChannelPosts);
contenRouter.post("/post/:id/like", isAuthenticated, likePost);
contenRouter.post("/post/:id/comment", isAuthenticated, addCommentToPost);
contenRouter.delete("/post/:id", isAuthenticated, deletePost);

export default contenRouter;
