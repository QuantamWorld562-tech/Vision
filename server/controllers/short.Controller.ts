import uploadOnCloudinary from "../config/cloudinary.ts";
import { Channel } from "../models/channel.Model.ts";
import { Short } from "../models/short.Model.ts";
import type { Request, Response } from "express";
import { Types } from "mongoose";

export const createShort = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const { title, description, tags, channelId } = req.body as {
      title: string;
      description?: string;
      tags?: string;
      channelId: string;
    };

    const channelData = await Channel.findById(channelId);
    if (!channelData) {
      return res.status(400).json({ message: "Channel not found" });
    }

    let shortUrl: string | undefined;
    if (req.file) {
      shortUrl = await uploadOnCloudinary(req.file.path);
    }

    if (!shortUrl) {
      return res.status(400).json({ message: "Short video file is required" });
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

export const getAllShorts = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const shorts = await Short.find()
      .sort({ createdAt: -1 })
      .populate("channel", "name avatar");

    return res.status(200).json(shorts);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get shorts: ${error}` });
  }
};

export const getShortById = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
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

export const likeShort = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const { id } = req.params;
    const userId = req.id!;

    const short = await Short.findById(id);
    if (!short) return res.status(404).json({ message: "Short not found" });

    const alreadyLiked = short.likes.some((id) => id.toString() === userId);
    if (alreadyLiked) {
      short.likes = short.likes.filter((id) => id.toString() !== userId) as typeof short.likes;
    } else {
      short.likes.push(new Types.ObjectId(userId));
      short.dislikes = short.dislikes.filter((id) => id.toString() !== userId) as typeof short.dislikes;
    }
    await short.save();

    return res
      .status(200)
      .json({ likes: short.likes.length, dislikes: short.dislikes.length });
  } catch (error) {
    return res.status(500).json({ message: `Failed to like short: ${error}` });
  }
};
