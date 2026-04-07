// ===== DOWNLOAD VIDEO =====
console.log("Downloading video...");
console.log("VIDEO URL:", video_url);

if (!video_url) {
  throw new Error("No video_url provided");
}

// safer yt-dlp command
const downloadCmd = `yt-dlp -f best -o "${inputPath}" "${video_url}"`;

console.log("RUNNING:", downloadCmd);

await run(downloadCmd);
