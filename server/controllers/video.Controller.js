import { Channel } from "../models/channel.Model.js";
import { Video } from "../models/video.Model.js";
import { User } from "../models/user.Model.js";
import uploadOnCloudinary from "../config/cloudinary.js";

export const createVideo = async (req, res) => {
  try {
    const { title, description, tags, channelId } = req.body;

    if (!title || !req.files?.video || !req.files?.thumbnail || !channelId) {
      return res.status(400).json({
        message: "Title, video, thumbnail and channelId are required",
        success: false,
      });
    }

    const channelData = await Channel.findById(channelId);
    if (!channelData) {
      return res.status(400).json({ message: "Channel not found", success: false });
    }

    const uploadVideo = await uploadOnCloudinary(req.files.video[0].path);
    const uploadThumbnail = await uploadOnCloudinary(req.files.thumbnail[0].path);

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = [];
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

    return res.status(201).json(newVideo);
  } catch (error) {
    return res.status(500).json({ message: `Failed to create video: ${error}` });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .populate("channel", "name avatar");

    return res.status(200).json(videos);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get videos: ${error}` });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true },
    ).populate("channel", "name avatar subscribes");

    if (!video) {
      return res.status(404).json({ message: "Video not found", success: false });
    }

    return res.status(200).json(video);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get video: ${error}` });
  }
};

export const likeVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.id;

    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const alreadyLiked = video.likes.includes(userId);
    if (alreadyLiked) {
      video.likes.pull(userId);
      // Also remove from user's likedVideos
      await User.findByIdAndUpdate(userId, { $pull: { likedVideos: id } });
    } else {
      video.likes.push(userId);
      video.dislikes.pull(userId); // remove dislike if switching
      // Also add to user's likedVideos
      await User.findByIdAndUpdate(userId, { $addToSet: { likedVideos: id } });
    }
    await video.save();

    return res.status(200).json({ likes: video.likes.length, dislikes: video.dislikes.length, liked: !alreadyLiked });
  } catch (error) {
    return res.status(500).json({ message: `Failed to like video: ${error}` });
  }
};

export const dislikeVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.id;

    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const alreadyDisliked = video.dislikes.includes(userId);
    if (alreadyDisliked) {
      video.dislikes.pull(userId);
    } else {
      video.dislikes.push(userId);
      video.likes.pull(userId); // remove like if switching
      // Also remove from user's likedVideos if switching from like to dislike
      await User.findByIdAndUpdate(userId, { $pull: { likedVideos: id } });
    }
    await video.save();

    return res.status(200).json({ likes: video.likes.length, dislikes: video.dislikes.length });
  } catch (error) {
    return res.status(500).json({ message: `Failed to dislike video: ${error}` });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.id;

    if (!message) return res.status(400).json({ message: "Comment message is required" });

    const video = await Video.findByIdAndUpdate(
      id,
      { $push: { comments: { author: userId, message } } },
      { new: true },
    ).populate("comments.author", "userName photoUrl");

    if (!video) return res.status(404).json({ message: "Video not found" });

    return res.status(201).json(video.comments);
  } catch (error) {
    return res.status(500).json({ message: `Failed to add comment: ${error}` });
  }
};
