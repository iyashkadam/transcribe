const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// ✅ Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ✅ Save transcription to Supabase
async function saveTranscription(audioUrl, filename, transcription) {
  console.log("📥 Saving transcription to Supabase...");

  const { data, error } = await supabase.from("transcriptions").insert([
    {
      audio_url: audioUrl || "No URL Provided",
      filename: filename || "Unknown",
      transcription: transcription || "No transcription available",
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error(
      "❌ Error saving transcription:",
      error.message,
      error.details
    );
    throw new Error("Failed to save transcription");
  }

  console.log("✅ Transcription saved to Supabase:", data);
}

// ✅ Transcribe & Save API
router.post("/transcribe", async (req, res) => {
  const { audio_url, filename } = req.body;
  if (!audio_url || !filename) {
    return res
      .status(400)
      .json({ error: "Audio URL and filename are required" });
  }

  try {
    console.log("📤 Sending audio to AssemblyAI...");

    const response = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      { audio_url },
      { headers: { Authorization: process.env.ASSEMBLYAI_API_KEY } }
    );

    const transcriptId = response.data.id;
    let transcription = "";

    while (!transcription) {
      const result = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { Authorization: process.env.ASSEMBLYAI_API_KEY },
        }
      );

      if (result.data.status === "completed") {
        transcription = result.data.text;
      } else if (result.data.status === "failed") {
        throw new Error("❌ AssemblyAI transcription failed.");
      }

      console.log("⏳ Waiting for transcription...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    console.log("✅ Transcription received:", transcription);

    await saveTranscription(audio_url, filename, transcription);

    res.json({ transcription });
  } catch (error) {
    console.error("❌ Error processing transcription:", error.message);
    res
      .status(500)
      .json({ error: "Transcription failed", details: error.message });
  }
});

// ✅ Get Transcription History
router.get("/history", async (req, res) => {
  try {
    console.log("📜 Fetching transcription history...");

    const { data, error } = await supabase
      .from("transcriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching history:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch history", details: error.message });
    }

    console.log("✅ Supabase History Response:", data); // Debugging line
    console.log("✅ Supabase History Response length:", data.length); //added debug line
    if (data.length > 0) {
      console.log("First history item:", data[0]); //added debug line
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
