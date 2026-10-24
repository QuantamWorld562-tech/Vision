// Shared TypeScript type definitions for the Vision client

// ── User & Auth ──────────────────────────────────────────────────────────────

export interface UserData {
  _id: string;
  userName: string;
  email: string;
  photoUrl?: string;
  channel?: string | ChannelData;
  subscriptions?: (string | ChannelData)[];
  likedVideos?: (string | VideoData)[];
  savedVideos?: (string | VideoData)[];
  savedPlaylists?: (string | PlaylistData)[];
  history?: HistoryItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HistoryItem {
  _id?: string;
  video: VideoData;
  watchedAt: string;
}

// ── Channel ───────────────────────────────────────────────────────────────────

export interface ChannelData {
  _id: string;
  name: string;
  description?: string;
  category: string;
  avatar?: string;
  banner?: string;
  owner: string | UserData;
  subscribes?: string[];
  videos?: VideoData[];
  shorts?: ShortData[];
  playlists?: PlaylistData[];
  communityPosts?: PostData[];
  createdAt?: string;
  updatedAt?: string;
}

// ── Video ─────────────────────────────────────────────────────────────────────

export interface CommentData {
  _id: string;
  author: UserData;
  message: string;
  replies?: CommentReplyData[];
  likes?: string[];
  isDeleted?: boolean;
  createdAt?: string;
}

export interface CommentReplyData {
  _id?: string;
  author: UserData;
  message: string;
  parentComment?: string;
  createdAt?: string;
}

export interface VideoData {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnail: string;
  tags?: string[];
  views?: number;
  likes?: string[];
  dislikes?: string[];
  saveBy?: string[];
  comments?: CommentData[];
  channel: ChannelData;
  createdAt?: string;
  updatedAt?: string;
  relevanceScore?: number;
}

// ── Short ─────────────────────────────────────────────────────────────────────

export interface ShortData {
  _id: string;
  title: string;
  description?: string;
  shortUrl: string;
  tags?: string[];
  views?: number;
  likes?: string[];
  dislikes?: string[];
  comments?: CommentData[];
  channel: ChannelData;
  createdAt?: string;
  updatedAt?: string;
}

// ── Playlist ──────────────────────────────────────────────────────────────────

export interface PlaylistData {
  _id: string;
  title: string;
  description?: string;
  visibility: "public" | "private" | "unlisted";
  videos?: VideoData[];
  saveBy?: string[];
  channel: ChannelData;
  createdAt?: string;
  updatedAt?: string;
}

// ── Post ──────────────────────────────────────────────────────────────────────

export interface PostData {
  _id: string;
  content: string;
  image?: string;
  likes?: string[];
  comments?: CommentData[];
  channel: ChannelData;
  createdAt?: string;
  updatedAt?: string;
}

// ── Studio Types ──────────────────────────────────────────────────────────────

export interface StudioOverview {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalVideos: number;
  totalShorts: number;
  subscribers: number;
}

export interface VideoPerformance {
  _id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface MonthlyData {
  label: string;
  views: number;
  uploads: number;
}

export interface StudioAnalyticsData {
  overview: StudioOverview;
  videoPerformance: VideoPerformance[];
  monthlyData: MonthlyData[];
}

// ── Redux Store ───────────────────────────────────────────────────────────────

export interface RootState {
  user: {
    userData: UserData | null;
    channelData: ChannelData | null;
    authLoading: boolean;
  };
}

// ── API Response helpers ──────────────────────────────────────────────────────

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// ── Sidebar / Nav items ───────────────────────────────────────────────────────

export interface NavItem {
  icon: string;
  text: string;
  path?: string;
}
