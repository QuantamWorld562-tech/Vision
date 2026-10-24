import type { Request, Response } from "express";
import { Channel } from "../models/channel.Model.ts";
import type { IChannel } from "../models/channel.Model.ts";
import { User } from "../models/user.Model.ts";
import { Video } from "../models/video.Model.ts";
import type { IVideo } from "../models/video.Model.ts";
import { Playlist } from "../models/playlist.Model.ts";
import { Comment } from "../models/comment.Model.ts";
import uploadOnCloudinary from "../config/cloudinary.ts";
import { Types } from "mongoose";
import { withTransaction } from "../services/transaction.service.ts";
import { getOrSetCache, invalidateCache, invalidatePattern } from "../services/cache.service.ts";

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.id;
  if (!userId) {
    return res.status(200).json({ user: null, success: true });
  }

  // find user but hide the password field from the result
  const user = await User.findById(userId);
  if (!user) {
    return res.status(200).json({ user: null, success: true });
  }
  return res.status(200).json({
    user,
    success: true,
  });
};

export const createChannel = async (req: Request, res: Response) => {
  const { name, description, category } = req.body as {
    name: string;
    description?: string;
    category: string;
  };
  const userId = req.id;
  const existingChannel = await Channel.findOne({ owner: userId });
  if (existingChannel) {
    return res
      .status(400)
      .json({ message: "User already has a channel", success: false });
  }
  const nameExists = await Channel.findOne({ name });
  if (nameExists) {
    return res.status(400).json({
      message: "Channel name already taken",
      success: false,
    });
  }

  let avatar: string | undefined;
  let banner: string | undefined;

  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  if (files?.avatar?.[0]?.path) {
    avatar = await uploadOnCloudinary(files.avatar[0].path);
  }
  if (files?.banner?.[0]?.path) {
    banner = await uploadOnCloudinary(files.banner[0].path);
  }

  const channel = await Channel.create({
    name,
    description,
    category,
    avatar,
    banner,
    owner: userId,
  });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { channel: channel._id, userName: name, photoUrl: avatar },
    { new: true },
  );

  return res.status(201).json({ channel, user: updatedUser });
};

export const getChannelData = async (req: Request, res: Response) => {
  const userId = req.id;
  const channel = await Channel.findOne({ owner: userId }).populate("owner");

  if (!channel)
    return res.status(404).json({ message: "Channel is not found" });

  return res.status(200).json(channel);
};

export const updateChannel = async (req: Request, res: Response) => {
  const userId = req.id;
  const { name, description, category } = req.body as {
    name?: string;
    description?: string;
    category?: string;
  };

  const channel = await Channel.findOne({ owner: userId });
  if (!channel) {
    return res
      .status(404)
      .json({ message: "Channel not found", success: false });
  }
  if (name && name !== channel.name) {
    const nameExists = await Channel.findOne({ name });
    if (nameExists)
      return res
        .status(400)
        .json({ message: "Channel name already taken", success: false });
  }

  let avatar: string | undefined = channel.avatar;
  let banner: string | undefined = channel.banner;

  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  if (files?.avatar?.[0]?.path) {
    avatar = await uploadOnCloudinary(files.avatar[0].path);
  }
  if (files?.banner?.[0]?.path) {
    banner = await uploadOnCloudinary(files.banner[0].path);
  }

  const updateFields: Record<string, unknown> = { avatar, banner };
  if (name) updateFields.name = name;
  if (description !== undefined) updateFields.description = description;
  if (category !== undefined) updateFields.category = category;

  const updatedChannel = await Channel.findByIdAndUpdate(
    channel._id,
    updateFields,
    { new: true },
  );

  const userUpdateFields: Record<string, unknown> = { photoUrl: avatar };
  if (name) userUpdateFields.userName = name;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    userUpdateFields,
    { new: true },
  );

  return res
    .status(200)
    .json({ channel: updatedChannel, user: updatedUser, success: true });
};

// ─── Subscribe / Unsubscribe ──────────────────────────────────────────────────

export const toggleSubscribe = async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const userId = req.id!;

  const channel = await Channel.findById(channelId);
  if (!channel) return res.status(404).json({ message: "Channel not found" });

  if (channel.owner.toString() === userId) {
    return res.status(400).json({ message: "You cannot subscribe to your own channel" });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const alreadySubscribed = user.subscriptions.some(
    (sub: Types.ObjectId) => sub.toString() === channelId
  );

  const result = await withTransaction(async (session) => {
    if (alreadySubscribed) {
      await User.findByIdAndUpdate(userId, { $pull: { subscriptions: channelId } }, { session });
      await Channel.findByIdAndUpdate(channelId, { $pull: { subscribes: userId } }, { session });
      return { subscribed: false, subscriberCount: Math.max(0, channel.subscribes.length - 1) };
    } else {
      await User.findByIdAndUpdate(userId, { $addToSet: { subscriptions: channelId } }, { session });
      await Channel.findByIdAndUpdate(channelId, { $addToSet: { subscribes: userId } }, { session });
      return { subscribed: true, subscriberCount: channel.subscribes.length + 1 };
    }
  });

  return res.status(200).json(result);
};

export const getSubscriptions = async (req: Request, res: Response) => {
  const userId = req.id!;
  const user = await User.findById(userId).populate({
    path: "subscriptions",
    select: "name avatar subscribes videos",
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(200).json(user.subscriptions);
};

// ─── Liked Content ────────────────────────────────────────────────────────────

export const getLikedVideos = async (req: Request, res: Response) => {
  const userId = req.id!;
  const user = await User.findById(userId).populate({
    path: "likedVideos",
    populate: { path: "channel", select: "name avatar" },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(200).json(((user.likedVideos || []) as unknown[]).reverse());
};

// ─── Saved Videos ─────────────────────────────────────────────────────────────

export const toggleSaveVideo = async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const userId = req.id!;

  const video = await Video.findById(videoId);
  if (!video) return res.status(404).json({ message: "Video not found" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const alreadySaved = user.savedVideos.some(
    (v: Types.ObjectId) => v.toString() === videoId
  );

  if (alreadySaved) {
    await User.findByIdAndUpdate(userId, { $pull: { savedVideos: videoId } });
    await Video.findByIdAndUpdate(videoId, { $pull: { saveBy: userId } });
    return res.status(200).json({ saved: false });
  } else {
    await User.findByIdAndUpdate(userId, { $addToSet: { savedVideos: videoId } });
    await Video.findByIdAndUpdate(videoId, { $addToSet: { saveBy: userId } });
    return res.status(200).json({ saved: true });
  }
};

export const getSavedVideos = async (req: Request, res: Response) => {
  const userId = req.id!;
  const user = await User.findById(userId).populate({
    path: "savedVideos",
    populate: { path: "channel", select: "name avatar" },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(200).json(((user.savedVideos || []) as unknown[]).reverse());
};

// ─── Saved Playlists ──────────────────────────────────────────────────────────

export const toggleSavePlaylist = async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const userId = req.id!;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) return res.status(404).json({ message: "Playlist not found" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const alreadySaved = user.savedPlaylists.some(
    (p: Types.ObjectId) => p.toString() === playlistId
  );

  if (alreadySaved) {
    await User.findByIdAndUpdate(userId, { $pull: { savedPlaylists: playlistId } });
    await Playlist.findByIdAndUpdate(playlistId, { $pull: { saveBy: userId } });
    return res.status(200).json({ saved: false });
  } else {
    await User.findByIdAndUpdate(userId, { $addToSet: { savedPlaylists: playlistId } });
    await Playlist.findByIdAndUpdate(playlistId, { $addToSet: { saveBy: userId } });
    return res.status(200).json({ saved: true });
  }
};

export const getSavedPlaylists = async (req: Request, res: Response) => {
  const userId = req.id!;
  const user = await User.findById(userId).populate({
    path: "savedPlaylists",
    populate: [
      { path: "channel", select: "name avatar" },
      { path: "videos", select: "thumbnail title" },
    ],
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(200).json(((user.savedPlaylists || []) as unknown[]).reverse());
};

// ─── Watch History ────────────────────────────────────────────────────────────

export const addToHistory = async (req: Request, res: Response) => {
  const videoId = req.params.videoId as string;
  const userId = req.id!;

  const video = await Video.findById(videoId);
  if (!video) return res.status(404).json({ message: "Video not found" });

  await User.findByIdAndUpdate(userId, {
    $pull: { history: { video: videoId } },
  });
  await User.findByIdAndUpdate(userId, {
    $push: {
      history: {
        $each: [{ video: new Types.ObjectId(videoId), watchedAt: new Date() }],
        $position: 0,
        $slice: 200,
      },
    },
  });

  return res.status(200).json({ message: "Added to history" });
};

export const getHistory = async (req: Request, res: Response) => {
  const userId = req.id!;
  const user = await User.findById(userId).populate({
    path: "history.video",
    populate: { path: "channel", select: "name avatar" },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(200).json(user.history || []);
};

export const clearHistory = async (req: Request, res: Response) => {
  const userId = req.id!;
  await User.findByIdAndUpdate(userId, { $set: { history: [] } });
  return res.status(200).json({ message: "History cleared" });
};

// ─── AI Search ────────────────────────────────────────────────────────────────

export const aiSearch = async (req: Request, res: Response) => {
  const { query } = req.query as { query?: string };
  if (!query) return res.status(400).json({ message: "Query is required" });

  const q = query.trim();
  const escapedTerms = q
    .split(/\s+/)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter(Boolean);
  const regex = new RegExp(escapedTerms.join("|"), "i");

  const videos = await Video.find({
    $or: [
      { title: { $regex: regex } },
      { description: { $regex: regex } },
      { tags: { $in: [regex] } },
    ],
  })
    .sort({ views: -1 })
    .limit(20)
    .populate("channel", "name avatar");

  const scored = videos.map((v) => {
    let score = 0;
    const lq = q.toLowerCase();
    if (v.title.toLowerCase().includes(lq)) score += 10;
    if ((v.tags as string[])?.some((t: string) => t.toLowerCase().includes(lq))) score += 5;
    if ((v.description as string)?.toLowerCase().includes(lq)) score += 2;
    return { ...v.toObject(), relevanceScore: score };
  });

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return res.status(200).json({ results: scored, query: q });
};

// ─── AI Category Filter ───────────────────────────────────────────────────────

export const getVideosByCategory = async (req: Request, res: Response) => {
  const { category, cursor, limit = "12" } = req.query as {
    category?: string;
    cursor?: string;
    limit?: string;
  };
  const pageSize = Math.min(parseInt(limit, 10) || 12, 50);

  const cacheKey = `vision:feed:cat:${category || "All"}:${cursor || "first"}:${pageSize}`;

  const data = await getOrSetCache(cacheKey, async () => {
    const query: Record<string, unknown> = {};
    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    if (!category || category === "All") {
      const videos = await Video.find(query)
        .sort({ _id: -1 })
        .limit(pageSize + 1)
        .populate("channel", "name avatar");

      const hasMore = videos.length > pageSize;
      const results = hasMore ? videos.slice(0, pageSize) : videos;
      const nextCursor = hasMore ? results[results.length - 1]._id : null;

      return { videos: results, nextCursor, hasMore };
    }

    const channelsInCategory = await Channel.find({
      category: { $regex: new RegExp(category, "i") },
    }).select("_id");

    const channelIds = channelsInCategory.map((c) => c._id);

    const categoryQuery = {
      ...query,
      $or: [
        { channel: { $in: channelIds } },
        { tags: { $regex: new RegExp(category, "i") } },
        { title: { $regex: new RegExp(category, "i") } },
      ],
    };

    const videos = await Video.find(categoryQuery)
      .sort({ views: -1, _id: -1 })
      .limit(pageSize + 1)
      .populate("channel", "name avatar");

    const hasMore = videos.length > pageSize;
    const results = hasMore ? videos.slice(0, pageSize) : videos;
    const nextCursor = hasMore ? results[results.length - 1]._id : null;

    return { videos: results, nextCursor, hasMore };
  }, 180);

  return res.status(200).json(data);
};

// ─── Recommended Content ──────────────────────────────────────────────────────

export const getRecommendations = async (req: Request, res: Response) => {
  const { videoId } = req.query as { videoId?: string };
  let recommendations: IVideo[] = [];

  if (videoId) {
    const sourceVideo = await Video.findById(videoId).populate("channel", "_id");
    if (sourceVideo) {
      const orConditions: Record<string, unknown>[] = [
        { channel: (sourceVideo.channel as unknown as IChannel)?._id },
      ];
      if ((sourceVideo.tags as string[])?.length) {
        const tagRegex = new RegExp((sourceVideo.tags as string[]).join("|"), "i");
        orConditions.push({ tags: { $in: [tagRegex] } });
      }

      recommendations = await Video.find({
        _id: { $ne: new Types.ObjectId(videoId) },
        $or: orConditions,
      })
        .sort({ views: -1 })
        .limit(15)
        .populate("channel", "name avatar");
    }
  }

  if (recommendations.length < 15) {
    const excludeIds = [
      ...(videoId ? [new Types.ObjectId(videoId)] : []),
      ...recommendations.map((v) => new Types.ObjectId(v._id)),
    ];

    const popular = await Video.find({ _id: { $nin: excludeIds } })
      .sort({ views: -1, createdAt: -1 })
      .limit(15 - recommendations.length)
      .populate("channel", "name avatar");

    recommendations = [...recommendations, ...popular];
  }

  return res.status(200).json(recommendations);
};

// ─── PT Studio Analytics ──────────────────────────────────────────────────────

interface VideoDoc {
  _id: unknown;
  title: string;
  thumbnail: string;
  views: number;
  likes?: unknown[];
  comments?: unknown[];
  createdAt: Date;
}

export const getStudioAnalytics = async (req: Request, res: Response) => {
  const userId = req.id!;
  const channel = await Channel.findOne({ owner: userId })
    .populate("videos")
    .populate("shorts");

  if (!channel) return res.status(404).json({ message: "Channel not found" });

  const videos = (channel.videos as unknown as VideoDoc[]) || [];
  const shorts = (channel.shorts as unknown as VideoDoc[]) || [];

  const totalViews =
    videos.reduce((sum, v) => sum + (v.views || 0), 0) +
    shorts.reduce((sum, s) => sum + (s.views || 0), 0);

  const totalLikes =
    videos.reduce((sum, v) => sum + (v.likes?.length || 0), 0) +
    shorts.reduce((sum, s) => sum + (s.likes?.length || 0), 0);

  const contentIds = [
    ...videos.map((v) => new Types.ObjectId(String(v._id))),
    ...shorts.map((s) => new Types.ObjectId(String(s._id))),
  ];

  const totalComments = contentIds.length > 0
    ? await Comment.countDocuments({ contentId: { $in: contentIds }, isDeleted: false })
    : 0;

  const commentCounts = contentIds.length > 0
    ? await Comment.aggregate([
        { $match: { contentId: { $in: contentIds }, isDeleted: false } },
        { $group: { _id: "$contentId", count: { $sum: 1 } } },
      ])
    : [];

  const commentCountMap = new Map<string, number>(
    commentCounts.map((c: { _id: unknown; count: number }) => [String(c._id), c.count])
  );

  const videoPerformance = videos
    .map((v) => ({
      _id: v._id,
      title: v.title,
      thumbnail: v.thumbnail,
      views: v.views || 0,
      likes: v.likes?.length || 0,
      comments: commentCountMap.get(String(v._id)) || 0,
      createdAt: v.createdAt,
    }))
    .sort((a, b) => b.views - a.views);

  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    const monthVideos = videos.filter((v) => {
      const vd = new Date(v.createdAt);
      return vd.getMonth() === d.getMonth() && vd.getFullYear() === d.getFullYear();
    });
    const views = monthVideos.reduce((sum, v) => sum + (v.views || 0), 0);
    return { label, views, uploads: monthVideos.length };
  }).reverse();

  return res.status(200).json({
    overview: {
      totalViews,
      totalLikes,
      totalComments,
      totalVideos: videos.length,
      totalShorts: shorts.length,
      subscribers: (channel.subscribes as unknown[])?.length || 0,
    },
    videoPerformance,
    monthlyData,
  });
};

// ─── Update Video ─────────────────────────────────────────────────────────────

export const updateVideoMeta = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.id!;
  const { title, description, tags } = req.body as {
    title?: string;
    description?: string;
    tags?: string;
  };

  const video = await Video.findById(id).populate("channel", "owner");
  if (!video) return res.status(404).json({ message: "Video not found" });

  const channelOwner = (video.channel as unknown as IChannel)?.owner;
  if (channelOwner?.toString() !== userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  let thumbnail: string = video.thumbnail as string;
  if (req.file) {
    thumbnail = (await uploadOnCloudinary(req.file.path)) ?? thumbnail;
  }

  let parsedTags = video.tags;
  if (tags) {
    try {
      parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    } catch {
      parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }

  const updated = await Video.findByIdAndUpdate(
    id,
    {
      title: title || video.title,
      description: description !== undefined ? description : video.description,
      tags: parsedTags,
      thumbnail,
    },
    { new: true },
  );

  // Invalidate caches
  invalidateCache(`vision:video:${id}`).catch(() => {});
  invalidatePattern("vision:feed:*").catch(() => {});

  return res.status(200).json(updated);
};

export const deleteVideo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.id!;

  const video = await Video.findById(id).populate("channel", "owner");
  if (!video) return res.status(404).json({ message: "Video not found" });

  const channelData = video.channel as unknown as IChannel;
  if (channelData?.owner?.toString() !== userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await Video.findByIdAndDelete(id);
  await Channel.findByIdAndUpdate(channelData._id, { $pull: { videos: id } });

  // Invalidate caches
  invalidateCache(`vision:video:${id}`).catch(() => {});
  invalidatePattern("vision:feed:*").catch(() => {});

  return res.status(200).json({ message: "Video deleted" });
};
