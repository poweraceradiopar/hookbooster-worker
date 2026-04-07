import express from "express";
import { exec } from "child_process";
import fs from "fs";
import util from "util";

const app = express();
app.use(express.json());

const run = util.promisify(exec);
const PORT = process.env.PORT || 3001;

const OUTPUT_DIR = "./outputs";
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// ===== MAIN PROCESS ENDPOINT =====
app.post("/process", async (req, res) => {
  try {
    const { video_url, style, aspect_ratio } = req.body;

    const inputPath = `./input_${Date.now()}.mp4`;

    // ===== DOWNLOAD VIDEO =====
    console.log("Downloading video...");
    await run(`yt-dlp -o "${inputPath}" ${video_url}`);

    // ===== CLIP TIMESTAMPS (MVP) =====
    const clips = [
      { start: 30, end: 60 },
      { start: 120, end: 150 },
      { start: 300, end: 330 }
    ];

    const results = [];

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const outputPath = `${OUTPUT_DIR}/clip_${Date.now()}_${i}.mp4`;

      const caption = generateCaption(i);
      const filter = buildFilter(style, aspect_ratio, caption);

      const cmd = `
        ffmpeg -y -i "${inputPath}" 
        -ss ${clip.start} -to ${clip.end}
        -vf "${filter}"
        -c:a copy
        "${outputPath}"
      `;

      console.log("Running FFmpeg...");
      await run(cmd);

      results.push({
        file: outputPath,
        caption,
        score: (Math.random() * 3 + 7).toFixed(1)
      });
    }

    res.json({ clips: results });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Processing failed" });
  }
});

// ===== CAPTIONS =====
function generateCaption(index) {
  const captions = [
    "This changed everything 🔥",
    "Nobody talks about this...",
    "Watch this before you quit"
  ];
  return captions[index % captions.length];
}

// ===== FILTER BUILDER =====
function buildFilter(style, aspect, caption) {
  const scale = getAspectFilter(aspect);
  const text = getTextStyle(style, caption);
  return `${scale},${text}`;
}

// ===== ASPECT RATIOS =====
function getAspectFilter(aspect) {
  if (aspect === "9:16") {
    return "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920";
  }
  if (aspect === "1:1") {
    return "scale=1080:1080";
  }
  return "scale=1920:1080";
}

// ===== TEXT STYLES =====
function getTextStyle(style, text) {
  const escaped = text.replace(/:/g, "\\:");

  switch (style) {
    case "Bold Viral":
      return `drawtext=text='${escaped}':fontcolor=white:fontsize=60:borderw=4:x=(w-text_w)/2:y=h-200`;

    case "Minimal Clean":
      return `drawtext=text='${escaped}':fontcolor=white:fontsize=30:x=(w-text_w)/2:y=h-100`;

    case "Meme Style":
      return `drawtext=text='${escaped.toUpperCase()}':fontcolor=white:fontsize=70:borderw=6:x=(w-text_w)/2:y=50`;

    case "Podcast":
      return `drawtext=text='${escaped}':fontcolor=white:fontsize=28:x=(w-text_w)/2:y=h-80`;

    case "Highlight Words":
      return `drawtext=text='${escaped}':fontcolor=yellow:fontsize=60:borderw=3:x=(w-text_w)/2:y=h-200`;

    default:
      return `drawtext=text='${escaped}':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=h-120`;
  }
}

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`Worker running on port ${PORT}`);
});