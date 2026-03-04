import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const app = express();
const PORT = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videosDir = path.join(__dirname, "..", "videos");

// 動画一覧API（まずは固定でOK）
app.get("/videos", (_req, res) => {
  res.json([
    { id: 1, title: "sample", url: "/static/sample.mp4", description: "テスト用の動画です。高評価＆チャンネル登録よろしくお願いします。" },
    { id: 2, title: "sample2", url: "/static/sample2.mp4", description: "テスト用の動画です。動画配信の仕組みを知りたい！" }
  ]);
});

// HLS生成API
app.get("/generate-hls", (_req, res) => {
  const args = [
    "-y",
    "-i", "videos/sample.mp4",

    // 映像を3種類に分岐
    "-filter_complex",
    "[0:v]split=3[v1][v2][v3];" +
    "[v1]scale=w=640:h=360[v1out];" +
    "[v2]scale=w=1280:h=720[v2out];" +
    "[v3]scale=w=1920:h=1080[v3out]",

    // 360p
    "-map", "[v1out]",
    "-map", "0:a",
    "-c:v:0", "libx264",
    "-b:v:0", "800k",
    "-c:a:0", "aac",
    "-b:a:0", "96k",

    // 720p
    "-map", "[v2out]",
    "-map", "0:a",
    "-c:v:1", "libx264",
    "-b:v:1", "2800k",
    "-c:a:1", "aac",
    "-b:a:1", "128k",

    // 1080p
    "-map", "[v3out]",
    "-map", "0:a",
    "-c:v:2", "libx264",
    "-b:v:2", "5000k",
    "-c:a:2", "aac",
    "-b:a:2", "192k",

    // HLS設定
    "-f", "hls",
    "-hls_time", "6",
    "-hls_playlist_type", "vod",

    // 出力設定
    "-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2",
    "-master_pl_name", "master.m3u8",
    "-hls_segment_filename", "hls/%v/seg_%03d.ts",
    "hls/%v/playlist.m3u8"
  ];

  const p = spawn("ffmpeg", args, { cwd: "/app" });

  let stderr = "";
  p.stderr.on("data", (d) => (stderr += d.toString()));

  p.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ ok: false, code, stderr });
    }
    res.json({ ok: true, playlist: "/hls/master.m3u8" });
  });
});

const hlsDir = path.join(__dirname, "..", "hls");
app.use("/hls", express.static(hlsDir));

// 動画ファイル配信（static）
app.use("/static", express.static(videosDir, {
  // 動画はキャッシュ周りでハマりやすいので最初は弱めでOK
  etag: true,
  lastModified: true
}));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`backend listening on http://localhost:${PORT}`);
});