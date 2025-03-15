const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// ✅ Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ✅ Configure Multer (store in memory)
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    console.error("❌ No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const uniqueFilename = `${Date.now()}-${req.file.originalname}`;
    console.log(`📂 Uploading ${uniqueFilename} to Supabase...`);

    // ✅ Upload file using axios
    const { data, error } = await supabase.storage
      .from("audio-uploads")
      .upload(uniqueFilename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false, // Avoid overwriting existing files
      });

    if (error) {
      throw new Error(`Supabase Upload Failed: ${error.message}`);
    }

    console.log("✅ File uploaded successfully:", data);

    // ✅ Generate Public URL
    const { data: publicUrlData } = supabase.storage
      .from("audio-uploads")
      .getPublicUrl(uniqueFilename);

    const fileUrl = publicUrlData.publicUrl;

    console.log("🌐 Public File URL:", fileUrl);

    res.json({ message: "File uploaded successfully", file_url: fileUrl });
  } catch (error) {
    console.error("❌ File upload error:", error.message);
    res.status(500).json({
      error: "Error uploading file to Supabase",
      details: error.message,
    });
  }
});

module.exports = router;
