# Feature Concepts: Video Player Upgrades & Nested Comments

This document explains **what** to build, **why** it matters, and **how** to implement it for your YouTube-like app (Vision).

---

## 7. Video Player Upgrades

### Current State
- Basic HTML5 `<video controls>` element
- No playback speed control
- No quality selector
- No Picture-in-Picture (PiP)
- No mini player (floating player when scrolling)
- Browser's native controls only

### What to Build

#### 7.1 Playback Speed Control
**What:** Dropdown to adjust playback rate (0.25x, 0.5x, 0.75x, **1x**, 1.25x, 1.5x, 1.75x, 2x)

**Why:**
- Power users want faster consumption (1.5x–2x for tutorials, podcasts)
- Slower speeds help non-native speakers or dense technical content
- Standard feature on YouTube, Vimeo, Coursera, etc.

**How:**
```javascript
// In WatchPage.jsx
const videoRef = useRef(null);
const [playbackRate, setPlaybackRate] = useState(1);

const handleSpeedChange = (speed) => {
  setPlaybackRate(speed);
  if (videoRef.current) {
    videoRef.current.playbackRate = speed;
  }
};

<video ref={videoRef} playbackRate={playbackRate} ... />
```

**UI Pattern:**
- Settings gear icon → popover menu → "Playback speed" → nested list (0.25x – 2x)
- Current speed marked with checkmark
- Store preference in `localStorage` for persistence

---

#### 7.2 Quality Selector (Multi-Resolution)
**What:** Manual quality picker (360p, 480p, 720p, 1080p, Auto)

**Why:**
- Users on slow connections need lower quality to avoid buffering
- High-quality displays deserve 1080p when bandwidth permits
- "Auto" adapts based on network (Adaptive Bitrate Streaming — HLS/DASH)

**How:**
```javascript
// Server side: Cloudinary generates multiple resolutions on upload
// or use ffmpeg to transcode into 360p/480p/720p/1080p .mp4 files
// Store URLs: { 360: "url360", 720: "url720", 1080: "url1080" }

// Client side:
const [quality, setQuality] = useState("auto"); // or "720"
const [qualities] = useState(["360p", "480p", "720p", "1080p", "Auto"]);

const handleQualityChange = (q) => {
  const currentTime = videoRef.current.currentTime;
  setQuality(q);
  // Switch video source
  videoRef.current.src = video.qualities[q]; // e.g., video.qualities["720"]
  videoRef.current.currentTime = currentTime; // resume from same timestamp
  videoRef.current.play();
};
```

**Implementation Options:**
1. **Simple (Static Quality):** Upload generates 360p, 720p, 1080p via Cloudinary transformations → store URLs in video doc
2. **Advanced (HLS/DASH):** Use `ffmpeg` to create adaptive manifests → use `video.js` or `hls.js` library

**Data Model Change:**
```javascript
// video.Model.js
videoUrl: {
  type: String, // keep for backward compat (original)
  required: true,
},
qualities: {
  360: String,
  480: String,
  720: String,
  1080: String,
}, // optional — add when transcoding is ready
```

**Start simple:** Store one `videoUrl`, add a "Quality: Auto" label (no-op), prepare schema for future expansion.

---

#### 7.3 Picture-in-Picture (PiP)
**What:** Float the video in a small window that stays on top while browsing other tabs or apps

**Why:**
- Multitasking — watch while reading docs, checking email, etc.
- Native browser API — 5 lines of code
- Modern UX expectation (YouTube, Twitch, Netflix all support it)

**How:**
```javascript
const handlePiP = async () => {
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await videoRef.current.requestPictureInPicture();
    }
  } catch (err) {
    console.error("PiP failed:", err);
  }
};

// UI: Add a button in custom controls
<button onClick={handlePiP} title="Picture-in-Picture">
  <span className="material-symbols-outlined">picture_in_picture_alt</span>
</button>
```

**Browser Support:** Chrome, Edge, Safari 13.1+, Firefox 69+. Gracefully degrade (hide button if unsupported):
```javascript
const [pipSupported] = useState("pictureInPictureEnabled" in document);
{pipSupported && <button onClick={handlePiP}>...</button>}
```

---

#### 7.4 Mini Player (Floating Player on Scroll)
**What:** When user scrolls down past the video, shrink it into a fixed bottom-right corner (like YouTube's mini player)

**Why:**
- Read comments while watching
- Browse recommendations without pausing
- Keeps engagement high — user doesn't have to choose between watching and exploring

**How:**
```javascript
const [isMiniPlayer, setIsMiniPlayer] = useState(false);
const playerRef = useRef(null);

useEffect(() => {
  const handleScroll = () => {
    if (!playerRef.current) return;
    const rect = playerRef.current.getBoundingClientRect();
    // If video scrolled above viewport, activate mini player
    setIsMiniPlayer(rect.bottom < 0);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

return (
  <>
    {/* Main player container */}
    <div ref={playerRef} className={isMiniPlayer ? "invisible" : ""}>
      <video ref={videoRef} ... />
    </div>

    {/* Mini player — fixed bottom-right */}
    {isMiniPlayer && (
      <div className="fixed bottom-4 right-4 w-80 z-50 shadow-2xl rounded-xl overflow-hidden">
        <div className="bg-black relative group">
          <video ref={videoRef} ... />
          <button
            onClick={() => {
              setIsMiniPlayer(false);
              playerRef.current.scrollIntoView({ behavior: "smooth" });
            }}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    )}
  </>
);
```

**Edge Cases:**
- Pause mini player when navigating away (`useEffect` cleanup)
- Disable mini player on mobile (limited screen space)
- Add "Expand" button to scroll back to full player

---

#### 7.5 Custom Controls Overlay
**Why build custom controls?**
- Browser controls can't add speed/quality pickers
- Consistent design across browsers (Chrome vs Safari vs Firefox have different UIs)
- Allows advanced features (chapters, thumbnails on hover, heatmap)

**How:**
```javascript
// Hide native controls, render custom UI over video
<video ref={videoRef} controls={false} ... />

<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
  {/* Progress bar */}
  <input
    type="range"
    min="0"
    max={duration}
    value={currentTime}
    onChange={(e) => videoRef.current.currentTime = e.target.value}
    className="w-full"
  />

  {/* Play/pause, volume, speed, quality, PiP, fullscreen */}
  <div className="flex items-center justify-between mt-2">
    <button onClick={togglePlay}>
      <span className="material-symbols-outlined">
        {playing ? "pause" : "play_arrow"}
      </span>
    </button>
    <button onClick={handleSpeedMenu}>Speed: {playbackRate}x</button>
    <button onClick={handlePiP}>PiP</button>
    <button onClick={toggleFullscreen}>Fullscreen</button>
  </div>
</div>
```

**State to track:**
- `playing` (bool)
- `currentTime` (seconds)
- `duration` (seconds)
- `volume` (0–1)
- `muted` (bool)
- `playbackRate` (0.25–2)
- `buffered` (TimeRanges)

**Libraries (optional):**
- `react-player` — prebuilt player with HLS/DASH support
- `video.js` — robust, plugin ecosystem
- `plyr` — clean UI, easy customization

**Start with:** Native `<video>` + basic controls, then swap in a library if you need HLS or advanced analytics.

---

### Implementation Roadmap (Recommended Order)

1. **PiP** — 5 minutes, instant value, uses native API
2. **Playback Speed** — 20 minutes, huge UX win, stores in `localStorage`
3. **Mini Player** — 1 hour, scroll listener + fixed positioning
4. **Custom Controls** — 3–5 hours, foundation for quality picker
5. **Quality Selector** — Depends on video transcoding setup (could be a separate sprint)

---

## 8. Nested Comment Replies + Likes

### Current State
- Comments stored as flat array in `video.comments[]`
- Schema has `replySchema` but no UI or controller logic to add replies
- No like/dislike on comments
- No "Reply" button
- No nested indentation or threading

### What to Build

#### 8.1 Nested Replies
**What:** Each comment can have replies (1 level deep for now, like YouTube) with "Reply" button and expandable reply thread

**Why:**
- Conversations — users respond to each other, not just the video
- Context — replies stay grouped under parent comment
- Engagement — reply notifications, @mentions, community building

**How (Data Model):**
```javascript
// video.Model.js — already defined!
const replySchema = new mongoose.Schema({
  author: { type: ObjectId, ref: "User" },
  message: String,
  likes: [{ type: ObjectId, ref: "User" }], // ADD THIS
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  author: { type: ObjectId, ref: "User" },
  message: String,
  likes: [{ type: ObjectId, ref: "User" }], // ADD THIS
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
});
```

**How (Server):**
```javascript
// POST /api/v1/content/video/:id/comment/:commentId/reply
export const addReply = async (req, res) => {
  const { id, commentId } = req.params;
  const { message } = req.body;
  const userId = req.id;

  const video = await Video.findById(id);
  const comment = video.comments.id(commentId); // Mongoose subdoc getter
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  comment.replies.push({ author: userId, message });
  await video.save();

  // Repopulate to return author details
  await video.populate("comments.replies.author", "userName photoUrl");
  return res.status(201).json(video.comments);
};
```

**How (Client UI):**
```javascript
// In WatchPage.jsx — for each comment
const [replyTo, setReplyTo] = useState(null); // commentId or null
const [replyText, setReplyText] = useState("");

{video.comments.map((c) => (
  <div key={c._id}>
    <CommentCard comment={c} />
    <button onClick={() => setReplyTo(c._id)}>Reply</button>

    {/* Reply input (show only when replying to this comment) */}
    {replyTo === c._id && (
      <form onSubmit={(e) => handleReply(e, c._id)} className="ml-12 mt-2">
        <input
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={`Reply to ${c.author.userName}...`}
        />
        <button type="submit">Reply</button>
      </form>
    )}

    {/* Nested replies (indented) */}
    {c.replies?.length > 0 && (
      <div className="ml-12 mt-3 flex flex-col gap-2">
        {c.replies.map((r) => (
          <ReplyCard key={r._id} reply={r} />
        ))}
      </div>
    )}
  </div>
))}
```

**UX Patterns:**
- Click "Reply" → input appears below comment, prefilled with `@username`
- "Cancel" button clears `replyTo` state
- Show replies collapsed by default if >3, with "View 5 replies" toggle
- Sort replies chronologically (oldest first, like YouTube)

---

#### 8.2 Comment/Reply Likes
**What:** Heart/thumbs-up icon next to each comment and reply, shows count, toggles on click

**Why:**
- Community moderation — good comments rise to the top
- Engagement metric — "Top comments" sort by likes
- User feedback without full replies

**How (Server):**
```javascript
// POST /api/v1/content/video/:id/comment/:commentId/like
export const likeComment = async (req, res) => {
  const { id, commentId } = req.params;
  const userId = req.id;

  const video = await Video.findById(id);
  const comment = video.comments.id(commentId);

  if (comment.likes.includes(userId)) {
    comment.likes.pull(userId); // unlike
  } else {
    comment.likes.push(userId); // like
  }

  await video.save();
  return res.status(200).json({ likes: comment.likes.length, liked: !comment.likes.includes(userId) });
};

// POST /api/v1/content/video/:id/comment/:commentId/reply/:replyId/like
export const likeReply = async (req, res) => {
  const { id, commentId, replyId } = req.params;
  const userId = req.id;

  const video = await Video.findById(id);
  const comment = video.comments.id(commentId);
  const reply = comment.replies.id(replyId);

  if (reply.likes.includes(userId)) {
    reply.likes.pull(userId);
  } else {
    reply.likes.push(userId);
  }

  await video.save();
  return res.status(200).json({ likes: reply.likes.length });
};
```

**How (Client):**
```javascript
const [likedComments, setLikedComments] = useState(new Set());

const handleLikeComment = async (commentId) => {
  try {
    const res = await axios.post(
      `${serverUrl}/api/v1/content/video/${id}/comment/${commentId}/like`,
      {},
      { withCredentials: true }
    );
    setLikedComments((prev) => {
      const next = new Set(prev);
      res.data.liked ? next.add(commentId) : next.delete(commentId);
      return next;
    });
    // Update comment likes count in video state
  } catch {
    toast.error("Failed to like comment");
  }
};

// In CommentCard component
<button onClick={() => handleLikeComment(comment._id)}>
  <span className={likedComments.has(comment._id) ? "text-red-500" : ""}>
    favorite
  </span>
  {comment.likes?.length || 0}
</button>
```

---

#### 8.3 Sort Comments (Top / Newest)
**What:** Dropdown to sort comments by "Top comments" (most liked) or "Newest first"

**Why:**
- Top comments = best discussion, quality control
- Newest = real-time engagement, freshness

**How (Client):**
```javascript
const [sortBy, setSortBy] = useState("top"); // "top" | "newest"

const sortedComments = useMemo(() => {
  const arr = [...(video.comments || [])];
  if (sortBy === "top") {
    return arr.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  } else {
    return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}, [video.comments, sortBy]);
```

**UI:**
```javascript
<div className="flex items-center justify-between mb-4">
  <h3>{video.comments?.length} Comments</h3>
  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
    <option value="top">Top comments</option>
    <option value="newest">Newest first</option>
  </select>
</div>
```

---

#### 8.4 "View More Replies" (Pagination)
**What:** If a comment has >3 replies, show "View 5 more replies" button

**Why:**
- Performance — don't render 50 replies upfront
- UX — keep UI clean, user controls depth

**How:**
```javascript
const [expandedComments, setExpandedComments] = useState(new Set());

const toggleReplies = (commentId) => {
  setExpandedComments((prev) => {
    const next = new Set(prev);
    next.has(commentId) ? next.delete(commentId) : next.add(commentId);
    return next;
  });
};

// In render
{c.replies?.length > 3 && !expandedComments.has(c._id) ? (
  <>
    {c.replies.slice(0, 3).map((r) => <ReplyCard key={r._id} reply={r} />)}
    <button onClick={() => toggleReplies(c._id)} className="text-sm text-blue-600">
      View {c.replies.length - 3} more replies
    </button>
  </>
) : (
  c.replies.map((r) => <ReplyCard key={r._id} reply={r} />)
)}
```

---

#### 8.5 Edit/Delete Comments (Optional)
**What:** "⋮" menu on own comments → Edit or Delete

**Why:**
- Fix typos
- Remove inappropriate/regretted comments
- Standard feature (YouTube, Reddit, Twitter all have it)

**How (Server):**
```javascript
// PATCH /api/v1/content/video/:id/comment/:commentId
export const editComment = async (req, res) => {
  const { id, commentId } = req.params;
  const { message } = req.body;
  const userId = req.id;

  const video = await Video.findById(id);
  const comment = video.comments.id(commentId);

  if (comment.author.toString() !== userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  comment.message = message;
  comment.updatedAt = Date.now();
  await video.save();

  return res.status(200).json(video.comments);
};

// DELETE similar — use $pull or comment.remove()
```

**How (Client):**
```javascript
const [editing, setEditing] = useState(null); // commentId or null
const [editText, setEditText] = useState("");

{editing === c._id ? (
  <form onSubmit={(e) => handleEdit(e, c._id)}>
    <input value={editText} onChange={(e) => setEditText(e.target.value)} />
    <button type="submit">Save</button>
    <button onClick={() => setEditing(null)}>Cancel</button>
  </form>
) : (
  <>
    <p>{c.message}</p>
    {c.updatedAt && <span className="text-xs text-gray-400">(edited)</span>}
    {c.author._id === userData._id && (
      <button onClick={() => { setEditing(c._id); setEditText(c.message); }}>
        Edit
      </button>
    )}
  </>
)}
```

---

### Implementation Roadmap (Recommended Order)

1. **Comment Likes** — 30 min, quick win, adds engagement
2. **Add Reply Endpoint** — 45 min, server-side logic
3. **Reply UI** — 1.5 hours, nested rendering + reply form
4. **Sort Comments (Top/Newest)** — 20 min, client-side sort
5. **Expand/Collapse Replies** — 30 min, state management
6. **Edit/Delete** (optional) — 1 hour, adds polish

---

## Summary Table

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| **Playback Speed** | 20 min | High (power users love it) | 🔥 High |
| **PiP** | 5 min | Medium (nice-to-have) | Medium |
| **Mini Player** | 1 hour | High (engagement++) | 🔥 High |
| **Quality Selector** | 5+ hours (needs transcoding) | Medium (bandwidth control) | Low (future) |
| **Custom Controls** | 3–5 hours | High (foundation for all above) | High |
| **Comment Likes** | 30 min | High (community engagement) | 🔥 High |
| **Nested Replies** | 2 hours | High (real conversations) | 🔥 High |
| **Sort Comments** | 20 min | Medium (QoL) | Medium |
| **Expand/Collapse Replies** | 30 min | Medium (performance) | Medium |
| **Edit/Delete Comments** | 1 hour | Low (polish) | Low |

---

## Tech Stack Recommendations

### Video Player
- **Start:** Native HTML5 `<video>` + custom controls
- **Upgrade to:** `react-player` (if you need HLS/DASH) or `video.js` (if you want plugins)

### Video Transcoding (Quality Selector)
- **Cloud:** Cloudinary video transformations (easiest, but costs per view)
- **Self-hosted:** `ffmpeg` via Node.js worker queue (BullMQ + Redis)
- **Service:** Mux, AWS Elemental MediaConvert, Bitmovin

### Comment Threading
- **Current setup works!** Your Mongoose schema already supports replies. Just add the UI + controller endpoints.

---

## Files to Modify

### Video Player Upgrades
- `client/src/pages/WatchPage.jsx` — add player state, refs, handlers
- `client/src/components/VideoPlayer.jsx` (new) — extract player into reusable component
- `client/src/styles/player.css` (optional) — custom control styles

### Nested Comments
- `server/controllers/video.Controller.js` — add `addReply`, `likeComment`, `likeReply`, `editComment`
- `server/routes/video.Routes.js` — mount new routes
- `server/models/video.Model.js` — add `likes: []` to `commentSchema` and `replySchema`
- `client/src/pages/WatchPage.jsx` — add reply UI, like buttons, sort dropdown
- `client/src/components/CommentCard.jsx` (new) — extract comment rendering logic
- `client/src/components/ReplyCard.jsx` (new) — reply rendering logic

---

## Next Steps

1. **Choose a starting point** (I recommend: PiP + Comment Likes — both are quick wins)
2. **Sketch the UI** (Figma or paper — where do buttons go?)
3. **Start with server changes** (new routes, update schema)
4. **Build the UI** (components, state, API calls)
5. **Test edge cases** (no replies, 100 replies, offline mode, mobile)
6. **Deploy & iterate** (get user feedback, refine UX)

Let me know which feature you'd like to implement first and I'll provide detailed code!
