import { Video } from "../models/video.Model.ts";
import { Short } from "../models/short.Model.ts";
import { Post } from "../models/post.Model.ts";
import { Channel } from "../models/channel.Model.ts";
import { User } from "../models/user.Model.ts";
import { Comment } from "../models/comment.Model.ts";

export const ensureDatabaseIndexes = async (): Promise<void> => {
  try {
    await Promise.all([
      Video.collection.createIndex({ channel: 1, createdAt: -1 }),
      Video.collection.createIndex({ title: "text", tags: "text", description: "text" }),
      Video.collection.createIndex({ views: -1, createdAt: -1 }),

      Short.collection.createIndex({ channel: 1, createdAt: -1 }),
      Short.collection.createIndex({ title: "text", tags: "text", description: "text" }),
      Short.collection.createIndex({ views: -1, createdAt: -1 }),

      Post.collection.createIndex({ channel: 1, createdAt: -1 }),

      Channel.collection.createIndex({ owner: 1 }),
      Channel.collection.createIndex({ category: 1, createdAt: -1 }),
      Channel.collection.createIndex({ name: "text", description: "text" }),

      User.collection.createIndex({ email: 1 }, { unique: true }),
      User.collection.createIndex({ subscriptions: 1 }),
      User.collection.createIndex({ likedVideos: 1 }),
      User.collection.createIndex({ savedVideos: 1 }),
      User.collection.createIndex({ "history.video": 1 }),

      Comment.collection.createIndex({ contentType: 1, contentId: 1, createdAt: -1 }),
      Comment.collection.createIndex({ contentId: 1, createdAt: -1 }),
      Comment.collection.createIndex({ author: 1 }),
    ]);

    console.log("Database indexes ensured for search, feed, subscriptions, comments, and content analytics.");
  } catch (error) {
    console.error("Failed to ensure database indexes:", error);
    throw error;
  }
};

export default ensureDatabaseIndexes;
