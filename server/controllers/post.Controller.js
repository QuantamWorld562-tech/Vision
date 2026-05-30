import { Channel } from "../models/channel.Model.js";
import { Post } from "../models/post.Model.js";
import uploadOnCloudinary from "../config/cloudinary.js";

export const createPost = async (req, res) => {
  try {
    const { content, channelId } = req.body;

    if (!content || !channelId) {
      return res.status(400).json({ message: "Content and channelId are required" });
    }

    const channelData = await Channel.findById(channelId);
    if (!channelData) {
      return res.status(404).json({ message: "Channel not found" });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadOnCloudinary(req.file.path);
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
  } catch (error) {
    return res.status(500).json({ message: `Failed to create post: ${error}` });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("channel", "name avatar");

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get posts: ${error}` });
  }
};

export const getChannelPosts = async (req, res) => {
  try {
    const { channelId } = req.params;
    const posts = await Post.find({ channel: channelId })
      .sort({ createdAt: -1 })
      .populate("channel", "name avatar");

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get channel posts: ${error}` });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();

    return res.status(200).json({ likes: post.likes.length });
  } catch (error) {
    return res.status(500).json({ message: `Failed to like post: ${error}` });
  }
};

export const addCommentToPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.id;

    if (!message) return res.status(400).json({ message: "Comment message is required" });

    const post = await Post.findByIdAndUpdate(
      id,
      { $push: { comments: { author: userId, message } } },
      { new: true },
    ).populate("comments.author", "userName photoUrl");

    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.status(201).json(post.comments);
  } catch (error) {
    return res.status(500).json({ message: `Failed to add comment: ${error}` });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.id;

    const post = await Post.findById(id).populate("channel", "owner");
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.channel.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);
    await Channel.findByIdAndUpdate(post.channel._id, {
      $pull: { communityPosts: id },
    });

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to delete post: ${error}` });
  }
};
