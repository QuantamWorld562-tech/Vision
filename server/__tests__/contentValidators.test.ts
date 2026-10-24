import test from "node:test";
import assert from "node:assert/strict";
import {
  createChannelSchema,
  updateChannelSchema,
  createVideoSchema,
  updateVideoSchema,
  createShortSchema,
  createPlaylistSchema,
  addVideoToPlaylistSchema,
  createPostSchema,
  createCommentSchema,
  searchQuerySchema,
  paginationQuerySchema,
} from "../validators/schemas.ts";

const validObjectId = "507f1f77bcf86cd799439011";

test("createChannelSchema accepts valid inputs and rejects invalid ones", () => {
  const valid = createChannelSchema.safeParse({
    name: "Tech Talks",
    description: "Deep dive into web architecture",
    category: "Technology",
  });
  assert.equal(valid.success, true);

  const invalid = createChannelSchema.safeParse({
    name: "A", // too short (< 2)
    category: "",
  });
  assert.equal(invalid.success, false);
});

test("updateChannelSchema allows partial updates", () => {
  const valid = updateChannelSchema.safeParse({
    name: "Updated Name",
  });
  assert.equal(valid.success, true);

  const empty = updateChannelSchema.safeParse({});
  assert.equal(empty.success, true);
});

test("createVideoSchema validates channelId as valid ObjectId", () => {
  const valid = createVideoSchema.safeParse({
    title: "Understanding Microservices",
    description: "Architectural overview",
    channelId: validObjectId,
  });
  assert.equal(valid.success, true);

  const invalid = createVideoSchema.safeParse({
    title: "No Channel",
    channelId: "invalid-id",
  });
  assert.equal(invalid.success, false);
});

test("updateVideoSchema validates title length bounds", () => {
  const valid = updateVideoSchema.safeParse({
    title: "New Video Title",
  });
  assert.equal(valid.success, true);

  const tooLong = updateVideoSchema.safeParse({
    title: "A".repeat(150),
  });
  assert.equal(tooLong.success, false);
});

test("createShortSchema requires channelId and valid title", () => {
  const valid = createShortSchema.safeParse({
    title: "Quick Coding Tip #1",
    channelId: validObjectId,
  });
  assert.equal(valid.success, true);

  const invalid = createShortSchema.safeParse({
    title: "Q",
    channelId: validObjectId,
  });
  assert.equal(invalid.success, false);
});

test("createPlaylistSchema validates visibility enum", () => {
  const valid = createPlaylistSchema.safeParse({
    title: "Web Dev 2026",
    visibility: "unlisted",
    channelId: validObjectId,
  });
  assert.equal(valid.success, true);

  const invalidVis = createPlaylistSchema.safeParse({
    title: "Web Dev 2026",
    visibility: "secret", // invalid enum
    channelId: validObjectId,
  });
  assert.equal(invalidVis.success, false);
});

test("addVideoToPlaylistSchema validates video ObjectId", () => {
  const valid = addVideoToPlaylistSchema.safeParse({ videoId: validObjectId });
  assert.equal(valid.success, true);

  const invalid = addVideoToPlaylistSchema.safeParse({ videoId: "12345" });
  assert.equal(invalid.success, false);
});

test("createPostSchema rejects empty content", () => {
  const valid = createPostSchema.safeParse({
    content: "Excited to launch our new series next week!",
    channelId: validObjectId,
  });
  assert.equal(valid.success, true);

  const invalid = createPostSchema.safeParse({
    content: "   ", // trims to empty
    channelId: validObjectId,
  });
  assert.equal(invalid.success, false);
});

test("createCommentSchema requires non-empty message", () => {
  const valid = createCommentSchema.safeParse({
    message: "Great video, learned a lot!",
  });
  assert.equal(valid.success, true);

  const invalid = createCommentSchema.safeParse({
    message: "",
  });
  assert.equal(invalid.success, false);
});

test("searchQuerySchema requires non-empty query", () => {
  const valid = searchQuerySchema.safeParse({ query: "typescript react" });
  assert.equal(valid.success, true);

  const invalid = searchQuerySchema.safeParse({ query: "   " });
  assert.equal(invalid.success, false);
});

test("paginationQuerySchema clamps limit between 1 and 50", () => {
  const parsed1 = paginationQuerySchema.safeParse({ limit: "100" });
  assert.equal(parsed1.success, true);
  if (parsed1.success) {
    assert.equal(parsed1.data.limit, 50);
  }

  const parsed2 = paginationQuerySchema.safeParse({ limit: "5" });
  assert.equal(parsed2.success, true);
  if (parsed2.success) {
    assert.equal(parsed2.data.limit, 5);
  }
});
