# Slide 2: Music Player Design

## Visual Design Concepts

### Minimal Floating Widget
- **Collapsed**: 52px glass circle with spinning cover art (no text overlay)
- **Expanded**: Compact card (300px wide) with cover + title row + progress bar + controls
- **Background**: Semi-transparent glass with subtle blur

### Animations
- **Vinyl spin**: Continuous 360° rotation (paused when not playing)
- **Equalizer bars**: Animated progress indicator
- **Play/Pause**: Smooth transition between states

### Controls
- **Prev/Next**: Circular buttons for track navigation
- **Play/Pause**: Center button with animated dot
- **Volume**: Horizontal slider (0-1 range)
- **Playlist**: Toggle to reveal numbered track list

### Background Playback
- Audio starts automatically on first user interaction
- Retries on subsequent interactions until browser permits
- Rotates through all 4 tracks in a loop
- Handles missing/corrupted files gracefully (skips to next track)

---

## Technical Implementation

- **Data layer**: `tracks.ts` contains 4 MP3 sources mapped to track titles
- **State management**: React component with `isPlaying`, `currentTrack`, `trackIndex`
- **Autoplay**: Triggered on mount + first user gesture
- **Error handling**: Missing files → jump to next track
- **Build**: `npx next build` passes cleanly
