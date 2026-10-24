import { Channel } from "../models/channel.Model.ts";
import { Post } from "../models/post.Model.ts";
import uploadOnCloudinary from "../config/cloudinary.ts";
import type { Request, Response } from "express";
import { Types } from "mongoose";

export const createPost = async (req: Request, res: Response) => {
  const { content, channelId } = req.body as {
    content: string;
    channelId: string;
  };

  const channelData = await Channel.findById(channelId);
  if (!channelData) {
    return res.status(404).json({ message: "Channel not found" });
  }

  let imageUrl = "";
  if (req.file) {
    imageUrl = (await uploadOnCloudinary(req.file.path)) || "";
  }

  const newPost = await Post.create({
    channel: channelData._id,
    content,
    image: imageUrl,
  });

  await Channel.findByIdAndUpdate(channelData._id, {
    $push: { communityPosts: newPost._id },
  });

  return res.status(201).json(newPost);
};

export const getAllPosts = async (_req: Request, res: Response) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("channel", "name avatar");

  return res.status(200).json(posts);
};

export const getChannelPosts = async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const posts = await Post.find({ channel: channelId })
    .sort({ createdAt: -1 })
    .populate("channel", "name avatar");

  return res.status(200).json(posts);
};

export const likePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.id!;

  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const alreadyLiked = post.likes.some((id) => id.toString() === userId);
  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== userId) as typeof post.likes;
  } else {
    post.likes.push(new Types.ObjectId(userId));
  }
  await post.save();

  return res.status(200).json({ likes: post.likes.length });
};

export const deletePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.id!;

  const post = await Post.findById(id).populate("channel", "owner");
  if (!post) return res.status(404).json({ message: "Post not found" });

  const channelOwner = (post.channel as unknown as { owner: Types.ObjectId }).owner;
  if (channelOwner.toString() !== userId) {
    return res.status(403).json({ message: "Not authorized to delete this post" });
  }

  await Post.findByIdAndDelete(id);
  await Channel.findByIdAndUpdate((post.channel as unknown as { _id: Types.ObjectId })._id, {
    $pull: { communityPosts: id },
  });

  return res.status(200).json({ message: "Post deleted successfully" });
};
