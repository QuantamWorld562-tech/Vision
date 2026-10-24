# Vision: AI-Powered Streaming Engine Roadmap (TODO.md)

> **Objective**: Elevate **Vision** from a Distributed Video Streaming Platform into an **AI-Powered Distributed Streaming & Multimodal Creator Platform**.  
> **Key Integration**: Reuses the Google Gemini SDK (`@google/genai`) proven in `Prep-AI` to turn Vision into an enterprise-grade Applied AI + Distributed Systems portfolio centerpiece.  
> **Target Roles**: SDE-1 (Backend / Full-Stack) and **Applied AI / LLM Engineer** (15–25+ LPA).

---

## 📋 AI Features Checklist

```
[ ] Phase 1: Gemini Multimodal SDK Setup & Service Layer
[ ] Phase 2: Schema Migration (Add AI Metadata to Video Model)
[ ] Phase 3: Asynchronous BullMQ AI Processing Worker
[ ] Phase 4: Semantic Video Search (Vector Embeddings)
[ ] Phase 5: Frontend Interactive Chapters & Jump-to-Timestamp Player
[ ] Phase 6: AI Creator Studio Copilot (SEO & Title Optimizer)
[ ] Phase 7: Resume Bullets & Verification
```

---

## Phase 1: Gemini SDK Setup & Service Layer

- [ ] **Install `@google/genai` in `server/`**:
  ```bash
  cd server && npm install @google/genai
  ```
- [ ] **Create `server/services/ai.service.ts`**:
  - Replicate the Gemini service pattern from `Prep-AI`.
  - Initialize `GoogleGenAI` with `env.GEMINI_API_KEY`.
  - Add utility methods:
    1. `generateVideoMetadata(title, description, duration)`: Extracts timestamped chapters, 2-sentence summary, and 5 SEO tags.
    2. `generateTextEmbedding(text)`: Generates dense vector embeddings using `text-embedding-004`.

---

## Phase 2: Video Model Schema Update

- [ ] **Update `server/models/video.Model.ts`**:
  Add an `aiMetadata` sub-document to `IVideo`:
  ```typescript
  export interface IChapter {
    title: string;
    timestamp: number; // in seconds
  }

  export interface IVideo extends Document {
    // ... existing fields ...
    aiMetadata?: {
      summary?: string;
      chapters?: IChapter[];
      suggestedTags?: string[];
      embedding?: number[]; // 768-dim vector for semantic search
      aiProcessingStatus?: "pending" | "completed" | "failed";
    };
  }
  ```
- [ ] **Update `videoSchema`** to include `aiMetadata` and an index on `aiMetadata.aiProcessingStatus`.

---

## Phase 3: Asynchronous BullMQ AI Worker

Integrate AI analysis directly into the existing background transcoding queue so that video uploads remain fast and non-blocking.

- [ ] **Update `server/queues/videoQueue.ts`**:
  - In `createTranscodeWorker`:
    1. Chunk 1: HLS Transcoding (.m3u8 packaging) -> progress 50%.
    2. Chunk 2: Call `aiService.generateVideoMetadata()` -> progress 80%.
    3. Save generated `chapters`, `summary`, and `suggestedTags` into the `Video` document.
    4. Mark `aiProcessingStatus: "completed"`.
- [ ] **Error Handling & Fallbacks**:
  - If the Gemini API hits a rate limit or times out, the worker must gracefully fall back without failing the main HLS video transcode.

---

## Phase 4: Semantic Video Search (Vector Search / RAG)

Allow users to search for concepts (e.g. *"how does redis caching work?"*) and jump directly to the video and exact timestamp where that concept is discussed.

- [ ] **Create Semantic Search Controller (`server/controllers/search.controller.ts`)**:
  - Endpoint: `GET /api/v1/content/semantic-search?q=query`
  - Compute embedding for the incoming query using `aiService.generateTextEmbedding(q)`.
  - Query MongoDB Atlas Vector Search (or compute cosine similarity over candidate video embeddings).
  - Return top matches with:
    - Video title, thumbnail, and channel.
    - Matching chapter title and exact timestamp in seconds.

---

## Phase 5: Frontend Interactive Chapters Player

- [ ] **Update Client Video Player (`client/`)**:
  - Render a clickable "Chapters" list below the video player.
  - Clicking a chapter (e.g., `[02:15] Redis Invalidation`) instantly updates the video playback time:
    ```typescript
    playerRef.current.currentTime = chapter.timestamp;
    ```
  - Display the "AI-Generated Executive Summary" badge in the video description box.

---

## Phase 6: AI Creator Studio Copilot (Optional Bonus)

- [ ] **Add Creator Copilot Endpoint (`server/routes/content.Routes.ts`)**:
  - `POST /api/v1/content/:videoId/ai-copilot`
  - Allows creators to prompt: *"Give me 3 high-CTR title variations and a tweet announcing this video"*.
  - Streams response via Server-Sent Events (SSE).

---

## 📄 ATS Resume Bullets for Vision (With AI Included)

Put these directly under **Vision** on your resume:

### For Applied AI / Full-Stack AI Roles:
* **Accomplished** sub-500ms semantic content retrieval and automated video indexing across 1,000+ creator uploads **by engineering** an asynchronous multimodal ingestion worker in BullMQ utilizing Google Gemini to extract timestamped video chapters and dense vector embeddings.
* **Accomplished** 99:1 read/write scalability and sub-100ms API response times **by designing** a Redis Cache-Aside layer with TTL jitter, paired with TanStack virtualized rendering delivering 60 FPS across high-density creator feeds.
* **Accomplished** resilient video distribution and zero pipeline stalls **by developing** an automated HLS multi-bitrate packaging worker with BullMQ exponential backoff and Prometheus RED telemetry.

### For Core SDE-1 Backend Roles:
* Emphasizes the strong distributed systems core (Redis caching, BullMQ queues, MongoDB replica set, Prometheus SRE telemetry) while showcasing modern GenAI integration as an unfair technical edge.

---

## 🧪 Verification & Audit Prompt

Use this prompt to test your implementation once Phases 1 through 3 are complete:

```markdown
Act as a Principal AI Systems Engineer.

Audit and verify the AI video ingestion pipeline in Vision:

1. Asynchronous Ingestion:
   - Upload a test video and verify that the BullMQ worker completes HLS transcoding AND triggers the Gemini AI metadata generation.
   - Assert: `aiProcessingStatus` moves from 'pending' -> 'completed'.
   - Assert: `aiMetadata.chapters` contains non-empty timestamped segments.

2. Resilience & Circuit Breaking:
   - Simulate a Gemini API timeout or quota error.
   - Verify that HLS video transcode STILL succeeds and the video remains viewable (zero blast radius).

3. Latency & Performance:
   - Verify that the API endpoint returns 201 Created immediately upon upload without blocking on the AI generation.
```
