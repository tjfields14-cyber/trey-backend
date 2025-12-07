import dotenv from "dotenv";
dotenv.config({ path: "/srv/fractured/config/app.env" });
import cors from "cors";
import express from "express";
import treyRoute from "./trey/routes/treyRoute.js";
import { pool } from "./db/index.js";
import { callChatCompletion } from "./services/aiService.js";

// Create server instance
const app = express();
const port = process.env.PORT || 3000;

// Core middleware
app.use(express.json());

// CORS protection
app.use(
  cors({
    origin: "*", // Later we can restrict this to your real domain or localhost
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// ─────────────────────────────────────────────
// Trey Knowledge Base routes
// Mounted at /kb
// treyRoute defines: POST /kb/ask
// ─────────────────────────────────────────────
app.use("/kb", treyRoute);

// ─────────────────────────────────────────────
// Health + DB + AI test
// ─────────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "fractured-backend",
    time: new Date().toISOString(),
  });
});

app.get("/db/ping", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({ status: "ok", dbTime: result.rows[0].now });
  } catch (err) {
    console.error("DB ping error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

app.get("/ai-test", async (req, res) => {
  try {
    const reply = await callChatCompletion(
      "Say exactly: Fracture backend online"
    );
    res.json({ status: "ok", reply });
  } catch (err) {
    console.error("AI test error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// Chapters: basic CRUD
// ─────────────────────────────────────────────

// Create a chapter
app.post("/chapters", async (req, res) => {
  try {
    const { chapterNumber, title, text } = req.body;

    if (!chapterNumber || !text) {
      return res.status(400).json({
        status: "error",
        error: "chapterNumber and text are required",
      });
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    const result = await pool.query(
      `
      INSERT INTO chapters (chapter_number, title, text, word_count)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [chapterNumber, title || null, text, wordCount]
    );

    res.json({ status: "ok", chapter: result.rows[0] });
  } catch (err) {
    console.error("Create chapter error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Get a single chapter
app.get("/chapters/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ status: "error", error: "Invalid id" });
    }

    const result = await pool.query("SELECT * FROM chapters WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", error: "Not found" });
    }

    res.json({ status: "ok", chapter: result.rows[0] });
  } catch (err) {
    console.error("Get chapter error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// List all chapters
app.get("/chapters", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM chapters ORDER BY chapter_number ASC, id ASC"
    );
    res.json({ status: "ok", chapters: result.rows });
  } catch (err) {
    console.error("List chapters error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// Chapter summaries
// ─────────────────────────────────────────────

// Generate + save a summary
app.post("/chapters/:id/summary", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ status: "error", error: "Invalid id" });
    }

    const styleHint = req.body?.styleHint || "";

    const result = await pool.query(
      "SELECT * FROM chapters WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", error: "Chapter not found" });
    }

    const chapter = result.rows[0];

    const prompt = `
You are helping an author manage a complex dark fantasy / horror manuscript called "Fractured".
Summarize the following chapter in 1–2 tight paragraphs.

The summary should:
- Preserve the emotional tone and tension
- Mention key events and character beats
- Avoid adding new details that are not in the text
${styleHint ? `- Style hint from author: ${styleHint}` : ""}

CHAPTER TITLE: ${chapter.title || "(untitled)"}
CHAPTER NUMBER: ${chapter.chapter_number}

CHAPTER TEXT:
${chapter.text}
    `.trim();

    const reply = await callChatCompletion(prompt);
    const summary = reply.trim();

    const updateResult = await pool.query(
      `
      UPDATE chapters
      SET summary = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [summary, id]
    );

    res.json({
      status: "ok",
      chapter: updateResult.rows[0],
      summary,
    });
  } catch (err) {
    console.error("Chapter summary error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Get stored summary
app.get("/chapters/:id/summary", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ status: "error", error: "Invalid id" });
    }

    const result = await pool.query(
      "SELECT id, chapter_number, title, summary FROM chapters WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", error: "Chapter not found" });
    }

    res.json({ status: "ok", chapter: result.rows[0] });
  } catch (err) {
    console.error("Get chapter summary error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// Chapter edits (AI line editor)
// ─────────────────────────────────────────────

// Create an edit
app.post("/chapters/:id/edit", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ status: "error", error: "Invalid id" });
    }

    const instructions = req.body?.instructions || "";

    const result = await pool.query(
      "SELECT * FROM chapters WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", error: "Chapter not found" });
    }

    const chapter = result.rows[0];

    const prompt = `
You are acting as a careful line editor for a dark fantasy / cosmic horror manuscript titled "Fractured".

Edit the chapter text below with these rules:
- Preserve the author's core voice and dark emotional tone.
- DO NOT change point of view or tense.
- DO NOT change factual events, character decisions, or worldbuilding logic.
- Improve clarity, rhythm, and flow of sentences.
- You may tighten repetition, sharpen wording, and enhance atmosphere.
- Do NOT summarize. Return a fully written chapter, not notes.
- Preserve the existing paragraph structure and breaks as much as possible.
${instructions ? `- Additional author instructions: ${instructions}` : ""}

Return ONLY the edited chapter text, nothing else, no explanations.

CHAPTER TITLE: ${chapter.title || "(untitled)"}
CHAPTER NUMBER: ${chapter.chapter_number}

CHAPTER TEXT:
${chapter.text}
    `.trim();

    const editedText = (await callChatCompletion(prompt)).trim();

    const insertResult = await pool.query(
      `
      INSERT INTO chapter_edits (chapter_id, instructions, edited_text)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [id, instructions || null, editedText]
    );

    res.json({
      status: "ok",
      edit: insertResult.rows[0],
    });
  } catch (err) {
    console.error("Chapter edit error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// List edits for a chapter
app.get("/chapters/:id/edits", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ status: "error", error: "Invalid id" });
    }

    const result = await pool.query(
      `
      SELECT id, chapter_id, instructions, created_at
      FROM chapter_edits
      WHERE chapter_id = $1
      ORDER BY created_at DESC, id DESC
      `,
      [id]
    );

    res.json({
      status: "ok",
      edits: result.rows,
    });
  } catch (err) {
    console.error("List chapter edits error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Get a single edit
app.get("/edits/:editId", async (req, res) => {
  try {
    const editId = Number(req.params.editId);
    if (!editId) {
      return res
        .status(400)
        .json({ status: "error", error: "Invalid edit id" });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM chapter_edits
      WHERE id = $1
      `,
      [editId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", error: "Edit not found" });
    }

    res.json({
      status: "ok",
      edit: result.rows[0],
    });
  } catch (err) {
    console.error("Get edit error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// Merge an edit into the canonical chapter
// ─────────────────────────────────────────────

app.post("/chapters/:id/merge-edit", async (req, res) => {
  const client = await pool.connect();

  try {
    const chapterId = Number(req.params.id);
    const editId = Number(req.body?.editId);
    const label = req.body?.label || null;

    if (!chapterId || !editId) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        status: "error",
        error: "Invalid chapter id or edit id",
      });
    }

    await client.query("BEGIN");

    const chapterResult = await client.query(
      "SELECT * FROM chapters WHERE id = $1",
      [chapterId]
    );

    if (chapterResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        status: "error",
        error: "Chapter not found",
      });
    }

    const editResult = await client.query(
      "SELECT * FROM chapter_edits WHERE id = $1",
      [editId]
    );

    if (editResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        status: "error",
        error: "Edit not found",
      });
    }

    const chapter = chapterResult.rows[0];
    const edit = editResult.rows[0];

    if (edit.chapter_id !== chapterId) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        status: "error",
        error: "This edit does not belong to the specified chapter",
      });
    }

    // Snapshot table must exist: chapter_versions
    await client.query(
      `
      INSERT INTO chapter_versions (chapter_id, text, summary, word_count, label)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        chapterId,
        chapter.text,
        chapter.summary || null,
        chapter.word_count || null,
        label || `pre-merge from edit ${editId}`,
      ]
    );

    const editedText = edit.edited_text || "";
    const wordCount = editedText.split(/\s+/).filter(Boolean).length;

    const updateResult = await client.query(
      `
      UPDATE chapters
      SET text = $1,
          word_count = $2,
          merged_edit_id = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
      `,
      [editedText, wordCount, editId, chapterId]
    );

    await client.query("COMMIT");

    res.json({
      status: "ok",
      chapter: updateResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Merge edit error:", err);
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Fractured backend is running.",
    time: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log("Fractured backend listening on port " + port);
});
