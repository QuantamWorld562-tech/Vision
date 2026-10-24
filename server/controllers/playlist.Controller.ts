import { Channel } from "../models/channel.Model.ts";
import { Playlist } from "../models/playlist.Model.ts";
import { Video } from "../models/video.Model.ts";
import type { Request, Response } from "express";
import type { Types } from "mongoose";

export const createPlaylist = async (req: Request, res: Response) => {
  const { title, description, visibility, channelId } = req.body as {
    title: string;
    description?: string;
    visibility?: "public" | "private" | "unlisted";
    channelId: string;
  };

  const channelData = await Channel.findById(channelId);
  if (!channelData) {
    return res.status(404).json({ message: "Channel not found" });
  }

  const newPlaylist = await Playlist.create({
    channel: channelData._id,
    title,
    description,
    visibility: visibility || "public",
  });

  await Channel.findByIdAndUpdate(channelData._id, {
    $push: { playlists: newPlaylist._id },
  });

  return res.status(201).json(newPlaylist);
};

export const getChannelPlaylists = async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const playlists = await Playlist.find({ channel: channelId })
    .sort({ createdAt: -1 })
    .populate("videos", "title thumbnail views");

  return res.status(200).json(playlists);
};

export const getPlaylistById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const playlist = await Playlist.findById(id)
    .populate("channel", "name avatar")
    .populate("videos", "title thumbnail views videoUrl createdAt");

  if (!playlist) return res.status(404).json({ message: "Playlist not found" });

  return res.status(200).json(playlist);
};

export const addVideoToPlaylist = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { videoId } = req.body as { videoId: string };
  const userId = req.id!;

  const playlist = await Playlist.findById(id).populate("channel", "owner");
  if (!playlist) return res.status(404).json({ message: "Playlist not found" });

  const channelOwner = (playlist.channel as unknown as { owner: Types.ObjectId }).owner;
  if (channelOwner.toString() !== userId) {
    return res.status(403).json({ message: "Not authorized to modify this playlist" });
  }

  const video = await Video.findById(videoId);
  if (!video) return res.status(404).json({ message: "Video not found" });

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    id,
    { $addToSet: { videos: videoId } },
    { new: true },
  );

  return res.status(200).json(updatedPlaylist);
};

export const removeVideoFromPlaylist = async (req: Request, res: Response) => {
  const { id, videoId } = req.params;
  const userId = req.id!;

  const playlist = await Playlist.findById(id).populate("channel", "owner");
  if (!playlist) return res.status(404).json({ message: "Playlist not found" });

  const channelOwner = (playlist.channel as unknown as { owner: Types.ObjectId }).owner;
  if (channelOwner.toString() !== userId) {
    return res.status(403).json({ message: "Not authorized to modify this playlist" });
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    id,
    { $pull: { videos: videoId } },
    { new: true },
  );

  return res.status(200).json(updatedPlaylist);
};

export const deletePlaylist = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.id!;

  const playlist = await Playlist.findById(id).populate("channel", "owner");
  if (!playlist) return res.status(404).json({ message: "Playlist not found" });

  const channelOwner = (playlist.channel as unknown as { owner: Types.ObjectId }).owner;
  if (channelOwner.toString() !== userId) {
    return res.status(403).json({ message: "Not authorized to delete this playlist" });
  }

  await Playlist.findByIdAndDelete(id);
  await Channel.findByIdAndUpdate((playlist.channel as unknown as { _id: Types.ObjectId })._id, {
    $pull: { playlists: id },
  });

  return res.status(200).json({ message: "Playlist deleted successfully" });
};
