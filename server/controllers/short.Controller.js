import uploadOnCloudinary from "../config/cloudinary.js";
import { Channel } from "../models/channel.Model.js";
import { Short } from "../models/short.Model.js";

export const createShort = async (req, res) => {
  try {
    const { title, description, tags, channelId } = req.body;

    if (!title || !channelId) {
      return res.status(400).json({ message: "Short title and channelId are required" });
    }

    const channelData = await Channel.findById(channelId);
    if (!channelData) {
      return res.status(400).json({ message: "Channel not found" });
    }

    let shortUrl;
    if (req.file) {
      shortUrl = await uploadOnCloudinary(req.file.path);
    }

    const newShort = await Short.create({
      channel: channelData._id,
      title,
      description,
      shortUrl,
      tags: tags ? JSON.parse(tags) : [],
    });

    await Channel.findByIdAndUpdate(channelData._id, {
      $push: { shorts: newShort._id },
    });

    return res.status(201).json(newShort);
  } catch (error) {
    return res.status(500).json({ message: `Failed to create short: ${error}` });
  }
};

export const getAllShorts = async (req, res) => {
  try {
    const shorts = await Short.find()
      .sort({ createdAt: -1 })
      .populate("channel", "name avatar");

    return res.status(200).json(shorts);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get shorts: ${error}` });
  }
};

export const getShortById = async (req, res) => {
  try {
    const { id } = req.params;
    const short = await Short.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true },
    ).populate("channel", "name avatar subscribes");

    if (!short) return res.status(404).json({ message: "Short not found" });

    return res.status(200).json(short);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get short: ${error}` });
  }
};

export const likeShort = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.id;

    const short = await Short.findById(id);
    if (!short) return res.status(404).json({ message: "Short not found" });

    const alreadyLiked = short.likes.includes(userId);
    if (alreadyLiked) {
      short.likes.pull(userId);
    } else {
      short.likes.push(userId);
      short.dislikes.pull(userId);
    }
    await short.save();

    return res.status(200).json({ likes: short.likes.length, dislikes: short.dislikes.length });
  } catch (error) {
    return res.status(500).json({ message: `Failed to like short: ${error}` });
  }
};
