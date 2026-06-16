# Vision 🎬

A full-stack video sharing platform built from scratch — inspired by YouTube. Users can upload videos, shorts, and community posts, interact with content, manage subscriptions, and creators get a dedicated studio with analytics and revenue insights.

**Live Demo:** [vision-app.vercel.app](https://vision-ecru-psi.vercel.app/) &nbsp;|&nbsp; **Backend API:** [vision-backend.onrender.com](https://vision-backend.onrender.com)

---

## Screenshots

> *(Add screenshots here after deployment)*

---

## Features

### 👤 Authentication
- Email/password signup and login with JWT (stored in httpOnly cookies)
- Google OAuth via Firebase
- OTP-based forgot password flow — 6-digit code sent to email, verified, then reset token issued
- Protected routes — unauthenticated users redirected to login

### 📺 Video Platform
- Upload videos with thumbnail, title, description, and tags
- Responsive video grid on home feed with skeleton loading states
- Full watch page — HTML5 video player, like/dislike, comments with replies, view count tracking
- AI-powered search — relevance-scored results ranked by title > tags > description match
- AI category filter — filters feed by channel category + video tags
- Content-based recommendations on every watch page

### 🎬 Shorts
- TikTok-style vertical scroll player
- Auto-play/pause using IntersectionObserver API
- Like, comment, mute toggle per short

### 📋 Playlists
- Create playlists with public/unlisted/private visibility
- Add and remove videos, save other channels' playlists to your library

### 📝 Community Posts
- Text posts with optional image upload
- Like and comment on posts
- Community tab on home feed

### 🔔 Subscriptions
- Subscribe/unsubscribe to channels (bidirectional sync)
- Subscriptions feed — videos from channels you follow
- Channels tab — manage all subscriptions in one place

### 📚 User Library
- **Liked Videos** — all videos you've liked, synced in real time
- **Saved Videos** — bookmark videos to watch later, remove inline
- **Saved Playlists** — save playlists from any channel
- **Watch History** — auto-tracked after 5 seconds of watching, capped at 200 entries, clearable

### 🎙️ Channel Management
- Create a channel with avatar, banner, name, description, category
- Full channel page with tabs — Videos, Shorts, Playlists, Community
- Update channel details in a clean 2-step form

### 🎛️ Vision Studio (Creator Dashboard)
- **Dashboard** — overview stats (views, likes, comments, subscribers, video/short count) + monthly bar chart + top 5 videos
- **Analytics** — detailed monthly views chart, engagement rates (like rate, comment rate), full video performance table
- **Revenue** — CPM-based estimated earnings, per-video revenue breakdown, monetisation tips
- **Content** — manage all uploaded videos, edit metadata (title, description, tags, thumbnail), delete videos

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool and dev server |
| React Router DOM | 7 | Client-side routing |
| Redux Toolkit | 2 | Global state (user + channel data) |
| Tailwind CSS | 4 | Utility-first styling |
| DaisyUI | 5 | Component library |
| Axios | 1.16 | HTTP requests |
| Firebase | 12 | Google OAuth |
| React Hot Toast | 2.6 | Toast notifications |
| React Icons | 5.6 | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5 | Web framework |
| MongoDB | Atlas | Database |
| Mongoose | 9 | ODM / schema modeling |
| JWT | 9 | Authentication tokens |
| bcrypt | 6 | Password hashing |
| Multer | 2 | File upload handling |
| Cloudinary | 2 | Media storage (videos, images) |
| Nodemailer | 8 | OTP email delivery |
| cookie-parser | 1.4 | Cookie handling |
| cors | 2.8 | Cross-origin requests |
| dotenv | 17 | Environment variables |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting (CDN, auto-deploy) |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database |
| Cloudinary | Video and image CDN |
| Firebase | Google authentication |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Vercel)                       │
│  React 19 + Vite + Redux + React Router + Tailwind CSS  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS (axios, withCredentials)
                       │ httpOnly JWT cookie
┌──────────────────────▼──────────────────────────────────┐
│                   SERVER (Render)                        │
│              Express 5 + Node.js 18                     │
│                                                         │
│  /api/v1/auth     → Authentication (7 routes)           │
│  /api/v1/user     → User features (22 routes)           │
│  /api/v1/content  → Content CRUD (26 routes)            │
└──────┬──────────────────────────┬───────────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────┐
│  MongoDB    │          │   Cloudinary    │
│  Atlas      │          │  (videos,       │
│  (data)     │          │   images)       │
└─────────────┘          └─────────────────┘
```

**Total API endpoints: 55**
- Auth: 7 endpoints
- User: 22 endpoints
- Content: 26 endpoints

---

## Project Structure

```
Vision/
├── client/                      # React frontend
│   ├── public/
│   │   └── logo.png
│   ├── src/
│   │   ├── assets/              # Static images
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Feed.jsx         # Home video grid + category filter
│   │   │   ├── Shorts.jsx       # TikTok-style vertical player
│   │   │   ├── PostCard.jsx     # Community post card
│   │   │   ├── CreateVideo.jsx
│   │   │   ├── CreateShorts.jsx
│   │   │   ├── CreatePlaylist.jsx
│   │   │   ├── CreatePost.jsx
│   │   │   ├── CreateChannel.jsx
│   │   │   ├── UpdateChannel.jsx
│   │   │   ├── ViewChannel.jsx  # Full channel page with tabs
│   │   │   ├── Profile.jsx      # Profile popup
│   │   │   └── Loader.jsx
│   │   ├── customHooks/
│   │   │   ├── GetCurrentUser.jsx
│   │   │   └── GetChannelData.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Layout shell (navbar, sidebar, categories)
│   │   │   ├── WatchPage.jsx    # Video player + recommendations
│   │   │   ├── SearchResults.jsx
│   │   │   ├── LikedVideos.jsx
│   │   │   ├── SavedVideos.jsx
│   │   │   ├── SavedPlaylists.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   ├── SubscriptionsPage.jsx
│   │   │   ├── CreatePage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── SignUP.jsx
│   │   │   └── studio/
│   │   │       ├── StudioDashboard.jsx
│   │   │       ├── StudioAnalytics.jsx
│   │   │       ├── StudioRevenue.jsx
│   │   │       ├── StudioContent.jsx
│   │   │       └── EditVideo.jsx
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── userSlice.js
│   │   ├── utils/
│   │   │   └── firebase.js
│   │   ├── App.jsx              # Router + ProtectedRoute
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vercel.json              # SPA routing config
│   └── package.json
│
└── server/                      # Express backend
    ├── config/
    │   ├── db.js                # MongoDB connection
    │   ├── cloudinary.js        # Cloudinary upload helper
    │   └── sendMail.js          # Nodemailer OTP sender
    ├── controllers/
    │   ├── auth.Controller.js   # signup, login, OTP flow
    │   ├── user.controller.js   # subscriptions, history, search, studio
    │   ├── video.Controller.js  # CRUD + like/dislike/comment
    │   ├── short.Controller.js  # CRUD + like
    │   ├── playlist.Controller.js
    │   └── post.Controller.js
    ├── middleware/
    │   ├── isAuthenticated.js   # JWT verification
    │   └── multer.js            # File upload config
    ├── models/
    │   ├── user.Model.js        # + subscriptions, history, liked/saved
    │   ├── channel.Model.js
    │   ├── video.Model.js
    │   ├── short.Model.js
    │   ├── playlist.Model.js
    │   └── post.Model.js
    ├── routes/
    │   ├── auth.Routes.js
    │   ├── user.Routes.js
    │   └── content.Routes.js
    ├── uploads/                 # Temp storage before Cloudinary
    │   └── .gitkeep
    ├── index.js                 # Express app entry point
    └── package.json
```

---

## Getting Started Locally

### Prerequisites
- Node.js 18+
- npm
- MongoDB Atlas account
- Cloudinary account
- Firebase project

### 1. Clone the repository
```bash
git clone https://github.com/QuantamWorld562-tech/Vision.git
cd Vision
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
SECRET_KEY=any_random_string_for_jwt
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 3. Set up the frontend
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_SERVER_URL=http://localhost:5000
VITE_FIREBASE_KEY=your_firebase_api_key
```

Start the frontend:
```bash
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## Key Implementation Highlights

**JWT in httpOnly cookies** — tokens are never accessible via JavaScript, protecting against XSS attacks. Every authenticated request sends the cookie automatically via `withCredentials: true`.

**Bidirectional subscription sync** — subscribing updates both `User.subscriptions` and `Channel.subscribes` atomically using MongoDB `$addToSet`, preventing race conditions and duplicate entries.

**IntersectionObserver for Shorts** — instead of scroll event listeners (which fire hundreds of times per second), IntersectionObserver fires only when a video enters/exits the viewport at 60% threshold, making the shorts player performant.

**Capped watch history** — MongoDB `$push` with `$position: 0` and `$slice: 200` inserts at the front and trims to 200 entries in a single atomic operation, keeping history always sorted newest-first without extra queries.

**AI search with relevance scoring** — regex search across title, description, and tags with weighted scoring (title match = +10, tag match = +5, description match = +2) returns results ranked by relevance rather than just date.

**Content-based recommendations** — finds videos sharing tags or channel with the current video, falls back to popularity-sorted videos to always fill 15 recommendation slots.

**Skeleton loading states** — every data-fetching component shows animated placeholder skeletons instead of spinners, matching the layout of the actual content for a perceived performance improvement.

---

## API Reference

### Auth — `/api/v1/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register with email/password |
| POST | `/login` | Login, returns JWT cookie |
| GET | `/logout` | Clear JWT cookie |
| POST | `/googleauth` | Google OAuth login |
| POST | `/forgot-password` | Send OTP to email |
| POST | `/verify-otp` | Verify OTP, get reset token |
| POST | `/reset-password` | Set new password |

### User — `/api/v1/user`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get current user |
| POST | `/createchannel` | ✅ | Create channel |
| GET | `/channel` | ✅ | Get own channel data |
| PUT | `/updatechannel` | ✅ | Update channel |
| POST | `/subscribe/:channelId` | ✅ | Toggle subscribe |
| GET | `/subscriptions` | ✅ | Get subscribed channels |
| GET | `/liked-videos` | ✅ | Get liked videos |
| POST | `/save-video/:videoId` | ✅ | Toggle save video |
| GET | `/saved-videos` | ✅ | Get saved videos |
| POST | `/save-playlist/:id` | ✅ | Toggle save playlist |
| GET | `/saved-playlists` | ✅ | Get saved playlists |
| POST | `/history/:videoId` | ✅ | Add to watch history |
| GET | `/history` | ✅ | Get watch history |
| DELETE | `/history` | ✅ | Clear watch history |
| GET | `/search?query=` | ❌ | AI search |
| GET | `/category?category=` | ❌ | AI category filter |
| GET | `/recommendations?videoId=` | ❌ | Get recommendations |
| GET | `/studio/analytics` | ✅ | PT Studio analytics |
| PUT | `/video/:id` | ✅ | Update video metadata |
| DELETE | `/video/:id` | ✅ | Delete video |

### Content — `/api/v1/content`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-video` | ✅ | Upload video |
| GET | `/videos` | ❌ | Get all videos |
| GET | `/video/:id` | ❌ | Get video + increment views |
| POST | `/video/:id/like` | ✅ | Toggle like |
| POST | `/video/:id/dislike` | ✅ | Toggle dislike |
| POST | `/video/:id/comment` | ✅ | Add comment |
| POST | `/create-short` | ✅ | Upload short |
| GET | `/shorts` | ❌ | Get all shorts |
| GET | `/short/:id` | ❌ | Get short |
| POST | `/short/:id/like` | ✅ | Toggle like |
| POST | `/create-playlist` | ✅ | Create playlist |
| GET | `/playlists/:channelId` | ❌ | Get channel playlists |
| GET | `/playlist/:id` | ❌ | Get playlist |
| POST | `/playlist/:id/add-video` | ✅ | Add video to playlist |
| DELETE | `/playlist/:id/remove-video/:videoId` | ✅ | Remove video |
| DELETE | `/playlist/:id` | ✅ | Delete playlist |
| POST | `/create-post` | ✅ | Create community post |
| GET | `/posts` | ❌ | Get all posts |
| GET | `/posts/:channelId` | ❌ | Get channel posts |
| POST | `/post/:id/like` | ✅ | Toggle like |
| POST | `/post/:id/comment` | ✅ | Add comment |
| DELETE | `/post/:id` | ✅ | Delete post |

---

## 🔮 Future Improvements

### High Priority
- **Live streaming** — WebRTC or HLS-based live video with real-time chat using Socket.io
- **Real-time notifications** — Socket.io push notifications for new subscribers, comments, and likes
- **Video chapters** — timestamp-based chapter markers in video description, clickable in the player
- **Shorts comments** — inline comment drawer on the shorts player (currently shows count only)

### Search & Discovery
- **Vector search** — replace regex search with OpenAI embeddings + Pinecone for true semantic search ("funny cat videos" finds cat content even without those exact words)
- **Trending page** — videos ranked by views-per-hour in the last 24 hours
- **Personalised home feed** — collaborative filtering based on watch history and liked videos
- **Search autocomplete** — dropdown suggestions as you type using debounced API calls

### Creator Tools
- **Video chapters editor** — UI to add timestamp chapters to uploaded videos
- **Thumbnail A/B testing** — upload two thumbnails, system picks the one with higher CTR
- **Audience demographics** — analytics breakdown by device, geography, traffic source
- **Revenue withdrawal** — Stripe integration for actual payouts (currently estimates only)
- **Scheduled publishing** — set a future date/time for a video to go public
- **Bulk video management** — select multiple videos to delete, change visibility, or add to playlist

### Video Player
- **Quality selector** — 360p / 720p / 1080p using Cloudinary transformations
- **Playback speed** — 0.5x, 1x, 1.25x, 1.5x, 2x controls
- **Auto-play next video** — queue system that plays the next recommended video
- **Picture-in-picture** — browser PiP API support
- **Subtitles/captions** — upload SRT files, render as WebVTT tracks on the video element
- **Mini player** — floating video player when scrolling down the watch page

### Social Features
- **Comment likes and replies** — nested reply threads on video comments
- **Share button** — copy link, share to social media
- **Clip creation** — select a time range from a video and share as a short clip
- **Polls in community posts** — multiple choice polls with real-time vote counts
- **Channel memberships** — paid tiers with exclusive content (Stripe)

### Performance & Infrastructure
- **Lazy loading routes** — code splitting with `React.lazy()` to reduce initial bundle size (currently 660KB)
- **Redis caching** — cache popular video feeds and search results to reduce MongoDB load
- **CDN for uploads** — serve Cloudinary assets through a custom domain
- **Rate limiting** — express-rate-limit on auth endpoints to prevent brute force
- **Video compression** — ffmpeg pipeline to compress videos before Cloudinary upload
- **Infinite scroll** — replace static 40-video limit with cursor-based pagination

### Mobile
- **PWA support** — service worker + manifest for installable app on mobile
- **Push notifications** — web push API for subscriber notifications
- **Offline viewing** — cache recently watched videos for offline playback

---

## Deployment

See [DEPLOY.md](./DEPLOY.md) for the complete step-by-step deployment guide covering Render (backend) and Vercel (frontend).

---

## License

MIT — free to use, modify, and distribute.

---

## Author

Built by **Kunal Yadav**

- GitHub: [@QuantamWorld562-tech](https://github.com/QuantamWorld562-tech)
