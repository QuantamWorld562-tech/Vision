import { Channel } from "../models/channel.Model.ts";
import { Video } from "../models/video.Model.ts";
import { User } from "../models/user.Model.ts";
import uploadOnCloudinary from "../config/cloudinary.ts";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import { recordUniqueView } from "../services/viewBuffer.service.ts";
import { invalidateCache, invalidatePattern } from "../services/cache.service.ts";
import { enqueueVideoTranscode } from "../queues/videoQueue.ts";

export const createVideo = async (req: Request, res: Response) => {
  const { title, description, tags, channelId } = req.body as {
    title: string;
    description?: string;
    tags?: string;
    channelId: string;
  };

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  if (!files?.video?.[0] || !files?.thumbnail?.[0]) {
    return res.status(400).json({
      message: "Title, video, thumbnail and channelId are required",
      success: false,
    });
  }

  const channelData = await Channel.findById(channelId);
  if (!channelData) {
    return res.status(400).json({ message: "Channel not found", success: false });
  }

  const uploadVideo = await uploadOnCloudinary(files.video[0].path);
  const uploadThumbnail = await uploadOnCloudinary(files.thumbnail[0].path);

  let parsedTags: string[] = [];
  if (tags) {
    try {
      parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    } catch {
      parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }

  const newVideo = await Video.create({
    title,
    channel: channelData._id,
    description,
    tags: parsedTags,
    videoUrl: uploadVideo,
    thumbnail: uploadThumbnail,
  });

  await Channel.findByIdAndUpdate(channelData._id, {
    $push: { videos: newVideo._id },
  });

  // Enqueue background HLS transcoding job (resilient/non-blocking)
  if (uploadVideo) {
    enqueueVideoTranscode({
      videoId: newVideo._id.toString(),
      inputPath: uploadVideo,
      channelId: channelData._id.toString(),
    }).catch(() => {});
  }

  // Invalidate feed caches
  invalidatePattern("vision:feed:*").catch(() => {});

  return res.status(201).json(newVideo);
};

export const getAllVideos = async (_req: Request, res: Response) => {
  const videos = await Video.find()
    .sort({ createdAt: -1 })
    .populate("channel", "name avatar");

  return res.status(200).json(videos);
};

export const getVideoById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const video = await Video.findById(id).populate("channel", "name avatar subscribes");

  if (!video) {
    return res.status(404).json({ message: "Video not found", success: false });
  }

  // High-throughput deduplicated view recording (HyperLogLog + Buffer)
  const videoId = Array.isArray(id) ? id[0] : id;
  const viewerIdentifier = String(req.id || req.ip || "anonymous");
  recordUniqueView(videoId, viewerIdentifier).catch(() => {});

  return res.status(200).json(video);
};

export const likeVideo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.id!;

  const video = await Video.findById(id);
  if (!video) return res.status(404).json({ message: "Video not found" });

  const alreadyLiked = video.likes.some((item) => item.toString() === userId);
  if (alreadyLiked) {
    video.likes = video.likes.filter((item) => item.toString() !== userId) as typeof video.likes;
    await User.findByIdAndUpdate(userId, { $pull: { likedVideos: id } });
  } else {
    video.likes.push(new Types.ObjectId(userId));
    video.dislikes = video.dislikes.filter((item) => item.toString() !== userId) as typeof video.dislikes;
    await User.findByIdAndUpdate(userId, { $addToSet: { likedVideos: id } });
  }
  await video.save();
  invalidateCache(`vision:video:${id}`).catch(() => {});

  return res.status(200).json({
    likes: video.likes.length,
    dislikes: video.dislikes.length,
    liked: !alreadyLiked,
  });
};

export const dislikeVideo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.id!;

  const video = await Video.findById(id);
  if (!video) return res.status(404).json({ message: "Video not found" });

  const alreadyDisliked = video.dislikes.some((item) => item.toString() === userId);
  if (alreadyDisliked) {
    video.dislikes = video.dislikes.filter((item) => item.toString() !== userId) as typeof video.dislikes;
  } else {
    video.dislikes.push(new Types.ObjectId(userId));
    video.likes = video.likes.filter((item) => item.toString() !== userId) as typeof video.likes;
    await User.findByIdAndUpdate(userId, { $pull: { likedVideos: id } });
  }
  await video.save();
  invalidateCache(`vision:video:${id}`).catch(() => {});

  return res.status(200).json({ likes: video.likes.length, dislikes: video.dislikes.length });
};
