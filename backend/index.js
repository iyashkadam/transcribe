const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const uploadRoutes = require("./routes/upload"); // ✅ Import upload route
const transcriptionRoutes = require("./routes/transcription"); // ✅ Import transcription route


// Initialize Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Use the upload route
app.use("/upload", uploadRoutes);
app.use("/transcription", transcriptionRoutes); // ✅ Use the transcription route


// Test API Route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Save Transcription to Supabase Database
app.post("/save-transcription", async (req, res) => {
  const { filename, transcription } = req.body;

  if (!filename || !transcription) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    // Insert transcription into Supabase Database
    const { data, error } = await supabase
      .from("transcriptions")
      .insert([{ filename, transcription }]);

    if (error) throw error;

    res.json({ message: "Transcription saved successfully" });
  } catch (error) {
    console.error("Database insert error:", error);
    res.status(500).json({ error: "Error saving transcription" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
