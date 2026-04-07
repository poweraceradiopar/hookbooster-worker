// ===== DOWNLOAD VIDEO =====
console.log("Downloading video...");
console.log("VIDEO URL:", video_url);

if (!video_url) {
  throw new Error("No video_url provided");
}

await run(`yt-dlp -f "mp4" --no-check-certificates --geo-bypass -o "${inputPath}" "${video_url}"`);
