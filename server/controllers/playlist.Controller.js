import { Channel } from "../models/channel.Model.js";
import { Playlist } from "../models/playlist.Model.js";
import { Video } from "../models/video.Model.js";

export const createPlaylist = async (req, res) => {
  try {
    const { title, description, visibility, channelId } = req.body;

    if (!title || !channelId) {
      return res.status(400).json({ message: "Title and channelId are required" });
    }

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
  } catch (error) {
    return res.status(500).json({ message: `Failed to create playlist: ${error}` });
  }
};

export const getChannelPlaylists = async (req, res) => {
  try {
    const { channelId } = req.params;
    const playlists = await Playlist.find({ channel: channelId })
      .sort({ createdAt: -1 })
      .populate("videos", "title thumbnail views");

    return res.status(200).json(playlists);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get playlists: ${error}` });
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findById(id)
      .populate("channel", "name avatar")
      .populate("videos", "title thumbnail views videoUrl createdAt");

    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    return res.status(200).json(playlist);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get playlist: ${error}` });
  }
};

export const addVideoToPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { videoId } = req.body;

    if (!videoId) return res.status(400).json({ message: "videoId is required" });

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const playlist = await Playlist.findByIdAndUpdate(
      id,
      { $addToSet: { videos: videoId } }, // $addToSet prevents duplicates
      { new: true },
    );

    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    return res.status(200).json(playlist);
  } catch (error) {
    return res.status(500).json({ message: `Failed to add video to playlist: ${error}` });
  }
};

export const removeVideoFromPlaylist = async (req, res) => {
  try {
    const { id, videoId } = req.params;

    const playlist = await Playlist.findByIdAndUpdate(
      id,
      { $pull: { videos: videoId } },
      { new: true },
    );

    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    return res.status(200).json(playlist);
  } catch (error) {
    return res.status(500).json({ message: `Failed to remove video from playlist: ${error}` });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.id;

    const playlist = await Playlist.findById(id).populate("channel", "owner");
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    if (playlist.channel.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this playlist" });
    }

    await Playlist.findByIdAndDelete(id);
    await Channel.findByIdAndUpdate(playlist.channel._id, {
      $pull: { playlists: id },
    });

    return res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to delete playlist: ${error}` });
  }
};
