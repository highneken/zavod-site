#!/bin/bash
set -e

# Usage: ./gen_reveal.sh <name> (skilltree or savanna)
NAME=$1
PIXEL="images/${NAME}-pixel.png"
PNG="images/${NAME}.png"
VIDEO="images/${NAME}.mp4"
OUT="images/${NAME}_reveal.mp4"
TMP="/tmp/reveal_${NAME}"
W=1080
H=1350
FPS=30

rm -rf "$TMP" && mkdir -p "$TMP"

echo "=== Generating reveal video for $NAME ==="

# 1. Resize all sources to 1080x1350
echo "[1/7] Resizing sources..."
ffmpeg -y -i "$PIXEL" -vf "scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black" -q:v 2 "$TMP/pixel.png" 2>/dev/null
ffmpeg -y -i "$PNG" -vf "scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black" -q:v 2 "$TMP/png.png" 2>/dev/null

# Extract first 9 seconds of video, resize
ffmpeg -y -i "$VIDEO" -t 9 -vf "scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black" -r $FPS -c:v libx264 -pix_fmt yuv420p -an "$TMP/video_clip.mp4" 2>/dev/null

# 2. Segment 1: Pixel still (2 seconds)
echo "[2/7] Pixel still (2s)..."
ffmpeg -y -loop 1 -i "$TMP/pixel.png" -t 2 -r $FPS -c:v libx264 -pix_fmt yuv420p -vf "scale=${W}:${H}" "$TMP/seg1_pixel.mp4" 2>/dev/null

# 3. Segment 2: Scanline reveal pixel→PNG (0.3s = 9 frames)
echo "[3/7] Scanline reveal (0.3s)..."
# Use a blend from pixel to png with a vertical wipe
ffmpeg -y -loop 1 -i "$TMP/pixel.png" -loop 1 -i "$TMP/png.png" -filter_complex "
  [0:v]scale=${W}:${H},format=yuva420p[pixel];
  [1:v]scale=${W}:${H},format=yuva420p[png];
  [pixel][png]blend=all_mode=normal:all_opacity=0:all_expr='if(gt(Y/H, (N/9)), B, A)':shortest=1[out]
" -map "[out]" -t 0.3 -r $FPS -c:v libx264 -pix_fmt yuv420p "$TMP/seg2_scanline.mp4" 2>/dev/null || {
  # Fallback: simple crossfade
  ffmpeg -y -loop 1 -i "$TMP/pixel.png" -loop 1 -i "$TMP/png.png" -filter_complex "
    [0:v]scale=${W}:${H},format=yuv420p,fps=$FPS[a];
    [1:v]scale=${W}:${H},format=yuv420p,fps=$FPS[b];
    [a][b]xfade=transition=wipedown:duration=0.3:offset=0[out]
  " -map "[out]" -t 0.3 -c:v libx264 -pix_fmt yuv420p "$TMP/seg2_scanline.mp4" 2>/dev/null || {
    # Ultra fallback: just crossfade
    ffmpeg -y -loop 1 -i "$TMP/pixel.png" -t 0.3 -r $FPS -vf "scale=${W}:${H}" -c:v libx264 -pix_fmt yuv420p "$TMP/seg2_scanline.mp4" 2>/dev/null
  }
}

# 4. Segment 3: PNG still (0.5s)
echo "[4/7] PNG still (0.5s)..."
ffmpeg -y -loop 1 -i "$TMP/png.png" -t 0.5 -r $FPS -c:v libx264 -pix_fmt yuv420p -vf "scale=${W}:${H}" "$TMP/seg3_png.mp4" 2>/dev/null

# 5. Segment 4: Glitch (0.2s = 6 frames) — RGB split + brightness flicker
echo "[5/7] Glitch effect (0.2s)..."
ffmpeg -y -loop 1 -i "$TMP/png.png" -t 0.2 -r $FPS -vf "
  scale=${W}:${H},
  split=3[r][g][b];
  [r]colorchannelmixer=rr=1:rg=0:rb=0:gr=0:gg=0:gb=0:br=0:bg=0:bb=0,crop=w=${W}:h=${H}:x=8:y=0,pad=${W}:${H}:0:0:black[red];
  [g]colorchannelmixer=rr=0:rg=0:rb=0:gr=0:gg=1:gb=0:br=0:bg=0:bb=0[green];
  [b]colorchannelmixer=rr=0:rg=0:rb=0:gr=0:gg=0:gb=0:br=0:bg=0:bb=1,crop=w=${W}:h=${H}:x=0:y=0,pad=${W}:${H}:8:0:black[blue];
  [green][red]blend=all_mode=addition[rg];
  [rg][blue]blend=all_mode=addition,
  eq=brightness=0.1:contrast=1.5
" -c:v libx264 -pix_fmt yuv420p "$TMP/seg4_glitch.mp4" 2>/dev/null || {
  # Fallback: simple brightness flash
  ffmpeg -y -loop 1 -i "$TMP/png.png" -t 0.2 -r $FPS -vf "scale=${W}:${H},eq=brightness=0.3:contrast=2" -c:v libx264 -pix_fmt yuv420p "$TMP/seg4_glitch.mp4" 2>/dev/null
}

# 6. Segment 5: Video loop (9s)
echo "[6/7] Video segment (9s)..."
cp "$TMP/video_clip.mp4" "$TMP/seg5_video.mp4"

# 7. Segment 6: Glitch back + fade to pixel (0.5s)
echo "[7/7] Outro glitch + fade to pixel (0.5s)..."
ffmpeg -y -loop 1 -i "$TMP/png.png" -loop 1 -i "$TMP/pixel.png" -filter_complex "
  [0:v]scale=${W}:${H},format=yuv420p,fps=$FPS,trim=duration=0.5[a];
  [1:v]scale=${W}:${H},format=yuv420p,fps=$FPS,trim=duration=0.5[b];
  [a][b]xfade=transition=fadeblack:duration=0.3:offset=0.2[out]
" -map "[out]" -c:v libx264 -pix_fmt yuv420p "$TMP/seg6_outro.mp4" 2>/dev/null || {
  ffmpeg -y -loop 1 -i "$TMP/pixel.png" -t 0.5 -r $FPS -vf "scale=${W}:${H}" -c:v libx264 -pix_fmt yuv420p "$TMP/seg6_outro.mp4" 2>/dev/null
}

# Concat all segments
echo "=== Concatenating segments ==="
cat > "$TMP/concat.txt" << EOF
file 'seg1_pixel.mp4'
file 'seg2_scanline.mp4'
file 'seg3_png.mp4'
file 'seg4_glitch.mp4'
file 'seg5_video.mp4'
file 'seg6_outro.mp4'
EOF

ffmpeg -y -f concat -safe 0 -i "$TMP/concat.txt" -c:v libx264 -pix_fmt yuv420p -movflags +faststart -an "$OUT" 2>/dev/null

DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
SIZE=$(du -h "$OUT" | cut -f1)
echo "=== Done: $OUT ($SIZE, ${DURATION}s) ==="
