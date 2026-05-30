import { Channel } from "../models/channel.Model.js";
import { User } from "../models/user.Model.js";
import { Video } from "../models/video.Model.js";
import { Playlist } from "../models/playlist.Model.js";
import uploadOnCloudinary from "../config/cloudinary.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.id;

    // find user but hide the password field from the result
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User is not found" });
    }
    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const createChannel = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const userId = req.id;
    const existingChannel = await Channel.findOne({ owner: userId });
    if (existingChannel) {
      return res
        .status(400)
        .json({ message: "User already have a channel", success: false });
    }
    const nameExists = await Channel.findOne({ name });
    if (nameExists) {
      return res.status(400).json({
        message: "Channel name already taken",
        success: false,
      });
    }
    let avatar;
    let banner;

    if (req.files?.avatar) {
      avatar = await uploadOnCloudinary(req.files.avatar[0].path);
    }
    if (req.files?.banner) {
      banner = await uploadOnCloudinary(req.files.banner[0].path);
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
      { new: true }, // returns the updated document
    );

    return res.status(201).json({ channel, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: `Create channel error ${error}` });
  }
};

export const getChannelData = async (req, res) => {
  try {
    const userId = req.id;
    const channel = await Channel.findOne({ owner: userId }).populate("owner");

    if (!channel)
      return res.status(404).json({ message: "Channel is not found" });

    return res.status(200).json(channel);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to get Channel | ${error}` });
  }
};

export const updateChannel = async (req, res) => {
  try {
    const userId = req.id;
    const { name, description, category } = req.body;

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
      channel.name = name;
    }
    if (description !== undefined) channel.description = description;
    if (category !== undefined) channel.category = category;
    // keep existing images as fallback if no new file uploaded
    let avatar = channel.avatar;
    let banner = channel.banner;

    if (req.files?.avatar) {
      avatar = await uploadOnCloudinary(req.files.avatar[0].path);
    }
    if (req.files?.banner) {
      banner = await uploadOnCloudinary(req.files.banner[0].path);
    }

    const updatedChannel = await Channel.findByIdAndUpdate(
      channel._id,
      { name, description, category, avatar, banner },
      { new: true },
    );

    // keep user's userName and photoUrl in sync with channel
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userName: name, photoUrl: avatar },
      { new: true },
    );

    return res
      .status(200)
      .json({ channel: updatedChannel, user: updatedUser, success: true });
  } catch (error) {
    return res.status(500).json({ message: `Update channel error ${error}` });
  }
};

// ─── Subscribe / Unsubscribe ──────────────────────────────────────────────────

export const toggleSubscribe = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.id;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    // Prevent subscribing to own channel
    if (channel.owner.toString() === userId) {
      return res.status(400).json({ message: "You cannot subscribe to your own channel" });
    }

    const user = await User.findById(userId);
    const alreadySubscribed = user.subscriptions.includes(channelId);

    if (alreadySubscribed) {
      // Unsubscribe
      await User.findByIdAndUpdate(userId, { $pull: { subscriptions: channelId } });
      await Channel.findByIdAndUpdate(channelId, { $pull: { subscribes: userId } });
      return res.status(200).json({ subscribed: false, subscriberCount: channel.subscribes.length - 1 });
    } else {
      // Subscribe
      await User.findByIdAndUpdate(userId, { $addToSet: { subscriptions: channelId } });
      await Channel.findByIdAndUpdate(channelId, { $addToSet: { subscribes: userId } });
      return res.status(200).json({ subscribed: true, subscriberCount: channel.subscribes.length + 1 });
    }
  } catch (error) {
    return res.status(500).json({ message: `Failed to toggle subscription: ${error}` });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).populate({
      path: "subscriptions",
      select: "name avatar subscribes videos",
    });
    return res.status(200).json(user.subscriptions);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get subscriptions: ${error}` });
  }
};

// ─── Liked Content ────────────────────────────────────────────────────────────

export const getLikedVideos = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).populate({
      path: "likedVideos",
      populate: { path: "channel", select: "name avatar" },
    });
    return res.status(200).json(user.likedVideos.reverse()); // newest first
  } catch (error) {
    return res.status(500).json({ message: `Failed to get liked videos: ${error}` });
  }
};

// ─── Saved Videos ─────────────────────────────────────────────────────────────

export const toggleSaveVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.id;

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const user = await User.findById(userId);
    const alreadySaved = user.savedVideos.includes(videoId);

    if (alreadySaved) {
      await User.findByIdAndUpdate(userId, { $pull: { savedVideos: videoId } });
      await Video.findByIdAndUpdate(videoId, { $pull: { saveBy: userId } });
      return res.status(200).json({ saved: false });
    } else {
      await User.findByIdAndUpdate(userId, { $addToSet: { savedVideos: videoId } });
      await Video.findByIdAndUpdate(videoId, { $addToSet: { saveBy: userId } });
      return res.status(200).json({ saved: true });
    }
  } catch (error) {
    return res.status(500).json({ message: `Failed to toggle save: ${error}` });
  }
};

export const getSavedVideos = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).populate({
      path: "savedVideos",
      populate: { path: "channel", select: "name avatar" },
    });
    return res.status(200).json(user.savedVideos.reverse());
  } catch (error) {
    return res.status(500).json({ message: `Failed to get saved videos: ${error}` });
  }
};

// ─── Saved Playlists ──────────────────────────────────────────────────────────

export const toggleSavePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.id;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    const user = await User.findById(userId);
    const alreadySaved = user.savedPlaylists.includes(playlistId);

    if (alreadySaved) {
      await User.findByIdAndUpdate(userId, { $pull: { savedPlaylists: playlistId } });
      await Playlist.findByIdAndUpdate(playlistId, { $pull: { saveBy: userId } });
      return res.status(200).json({ saved: false });
    } else {
      await User.findByIdAndUpdate(userId, { $addToSet: { savedPlaylists: playlistId } });
      await Playlist.findByIdAndUpdate(playlistId, { $addToSet: { saveBy: userId } });
      return res.status(200).json({ saved: true });
    }
  } catch (error) {
    return res.status(500).json({ message: `Failed to toggle save playlist: ${error}` });
  }
};

export const getSavedPlaylists = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).populate({
      path: "savedPlaylists",
      populate: [
        { path: "channel", select: "name avatar" },
        { path: "videos", select: "thumbnail title" },
      ],
    });
    return res.status(200).json(user.savedPlaylists.reverse());
  } catch (error) {
    return res.status(500).json({ message: `Failed to get saved playlists: ${error}` });
  }
};

// ─── Watch History ────────────────────────────────────────────────────────────

export const addToHistory = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.id;

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Remove existing entry for this video (avoid duplicates), then push to front
    await User.findByIdAndUpdate(userId, {
      $pull: { history: { video: videoId } },
    });
    await User.findByIdAndUpdate(userId, {
      $push: {
        history: {
          $each: [{ video: videoId, watchedAt: new Date() }],
          $position: 0,
          $slice: 200, // keep only last 200 entries
        },
      },
    });

    return res.status(200).json({ message: "Added to history" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to add to history: ${error}` });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).populate({
      path: "history.video",
      populate: { path: "channel", select: "name avatar" },
    });
    return res.status(200).json(user.history);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get history: ${error}` });
  }
};

export const clearHistory = async (req, res) => {
  try {
    const userId = req.id;
    await User.findByIdAndUpdate(userId, { $set: { history: [] } });
    return res.status(200).json({ message: "History cleared" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to clear history: ${error}` });
  }
};

// ─── AI Search ────────────────────────────────────────────────────────────────

export const aiSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const q = query.trim();

    // Keyword-based semantic search using MongoDB text-like regex
    // In production you'd use a vector DB or OpenAI embeddings
    const regex = new RegExp(q.split(" ").join("|"), "i");

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

    // Score results by relevance (title match > tag match > description match)
    const scored = videos.map((v) => {
      let score = 0;
      const lq = q.toLowerCase();
      if (v.title.toLowerCase().includes(lq)) score += 10;
      if (v.tags?.some((t) => t.toLowerCase().includes(lq))) score += 5;
      if (v.description?.toLowerCase().includes(lq)) score += 2;
      return { ...v.toObject(), relevanceScore: score };
    });

    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return res.status(200).json({ results: scored, query: q });
  } catch (error) {
    return res.status(500).json({ message: `Search failed: ${error}` });
  }
};

// ─── AI Category Filter ───────────────────────────────────────────────────────

export const getVideosByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    if (!category || category === "All") {
      const videos = await Video.find()
        .sort({ createdAt: -1 })
        .limit(40)
        .populate("channel", "name avatar");
      return res.status(200).json(videos);
    }

    // Match videos whose tags or channel category match
    const channelsInCategory = await Channel.find({
      category: { $regex: new RegExp(category, "i") },
    }).select("_id");

    const channelIds = channelsInCategory.map((c) => c._id);

    const videos = await Video.find({
      $or: [
        { channel: { $in: channelIds } },
        { tags: { $regex: new RegExp(category, "i") } },
        { title: { $regex: new RegExp(category, "i") } },
      ],
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(40)
      .populate("channel", "name avatar");

    return res.status(200).json(videos);
  } catch (error) {
    return res.status(500).json({ message: `Failed to filter by category: ${error}` });
  }
};

// ─── Recommended Content ──────────────────────────────────────────────────────

export const getRecommendations = async (req, res) => {
  try {
    const { videoId } = req.query;

    let recommendations = [];

    if (videoId) {
      // Content-based: find videos with similar tags/channel
      const sourceVideo = await Video.findById(videoId).populate("channel", "_id");
      if (sourceVideo) {
        // Build $or conditions — always include channel match, add tags if present
        const orConditions = [{ channel: sourceVideo.channel?._id }];
        if (sourceVideo.tags?.length) {
          const tagRegex = new RegExp(sourceVideo.tags.join("|"), "i");
          orConditions.push({ tags: { $in: [tagRegex] } });
        }

        recommendations = await Video.find({
          _id: { $ne: videoId },
          $or: orConditions,
        })
          .sort({ views: -1 })
          .limit(15)
          .populate("channel", "name avatar");
      }
    }

    // Fill remaining slots with popular videos
    if (recommendations.length < 15) {
      const excludeIds = [videoId, ...recommendations.map((v) => v._id)].filter(Boolean);
      const popular = await Video.find({ _id: { $nin: excludeIds } })
        .sort({ views: -1, createdAt: -1 })
        .limit(15 - recommendations.length)
        .populate("channel", "name avatar");
      recommendations = [...recommendations, ...popular];
    }

    return res.status(200).json(recommendations);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get recommendations: ${error}` });
  }
};

// ─── PT Studio Analytics ──────────────────────────────────────────────────────

export const getStudioAnalytics = async (req, res) => {
  try {
    const userId = req.id;
    const channel = await Channel.findOne({ owner: userId })
      .populate("videos")
      .populate("shorts");

    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const videos = channel.videos || [];
    const shorts = channel.shorts || [];

    const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0)
      + shorts.reduce((sum, s) => sum + (s.views || 0), 0);

    const totalLikes = videos.reduce((sum, v) => sum + (v.likes?.length || 0), 0)
      + shorts.reduce((sum, s) => sum + (s.likes?.length || 0), 0);

    const totalComments = videos.reduce((sum, v) => sum + (v.comments?.length || 0), 0)
      + shorts.reduce((sum, s) => sum + (s.comments?.length || 0), 0);

    // Views per video (for chart data)
    const videoPerformance = videos
      .map((v) => ({
        _id: v._id,
        title: v.title,
        thumbnail: v.thumbnail,
        views: v.views || 0,
        likes: v.likes?.length || 0,
        comments: v.comments?.length || 0,
        createdAt: v.createdAt,
      }))
      .sort((a, b) => b.views - a.views);

    // Monthly views breakdown (last 6 months)
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
        subscribers: channel.subscribes?.length || 0,
      },
      videoPerformance,
      monthlyData,
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to get analytics: ${error}` });
  }
};

// ─── Update Video ─────────────────────────────────────────────────────────────

export const updateVideoMeta = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.id;
    const { title, description, tags } = req.body;

    const video = await Video.findById(id).populate("channel", "owner");
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.channel.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    let thumbnail = video.thumbnail;
    if (req.file) {
      thumbnail = await uploadOnCloudinary(req.file.path);
    }

    const updated = await Video.findByIdAndUpdate(
      id,
      {
        title: title || video.title,
        description: description !== undefined ? description : video.description,
        tags: tags ? JSON.parse(tags) : video.tags,
        thumbnail,
      },
      { new: true },
    );

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: `Failed to update video: ${error}` });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.id;

    const video = await Video.findById(id).populate("channel", "owner");
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.channel.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Video.findByIdAndDelete(id);
    await Channel.findByIdAndUpdate(video.channel._id, { $pull: { videos: id } });

    return res.status(200).json({ message: "Video deleted" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to delete video: ${error}` });
  }
};
