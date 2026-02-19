# 🎹 Learn Piano

A focused practice tool for learning piano songs from YouTube. Break any song into named sections, loop them until you nail it, and track what you've learned.

![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)

## Features

- **Add any song** via YouTube URL or video ID
- **Full-screen layout** — video fills the screen, parts panel docks to the side
- **Split into parts** — define named sections with start/end timestamps (e.g. Intro, Theme A, Bridge)
- **Auto-split** — divide the song into 30-second parts in one click
- **5-second countdown** — a visual overlay counts down before each part starts, so you have time to get your hands ready
- **Loop a single part** — repeat one section endlessly with a 5-second break between cycles
- **Loop multiple parts** — select any combination of parts (non-adjacent is fine) and repeat them together as a sequence
- **Play from here** — chain all parts from a selected one to the end
- **Skip intro** — set an offset so "Full Song" starts where the music actually begins
- **Track progress** — mark individual parts as learned; the active part is highlighted while playing
- **Persistent URL** — the current song is saved in the URL hash, so refreshing keeps you in place
- **Page title** — the browser tab shows the current song name

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3, Pinia, Vite |
| Backend | Node.js, Express |
| Storage | JSON file (`data/songs.json`) |
| Video | YouTube IFrame API |

No database required. Everything is stored in a single JSON file on disk.

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repo
git clone https://github.com/your-username/learn-piano.git
cd learn-piano

# 2. Install dependencies
npm install

# 3. Start the dev server (frontend + API run together)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### Adding a song
1. Click **+ Add Song**
2. Enter a title and paste a YouTube URL (or just the video ID)
3. Optionally set **Skip intro** — the number of seconds to jump past when playing the full song
4. Click **Save**

### Adding parts
1. Open a song and click **+ Add Part**, or use **Auto 30s** to split the whole song automatically
2. Give the part a name (auto-filled as "Part 1", "Part 2", etc.)
3. Set the **Start** and **End** timestamps in seconds
4. Add optional practice notes
5. Click **Save**

### Practicing

| Button | Action |
|--------|--------|
| **▶ Part** | Play just this section (5s countdown before playback) |
| **▶ From here** | Play this and all following parts in sequence |
| **🔁** | Toggle this part into the repeat selection |
| **▶ Repeat** | Loop all selected parts in song order, 5s pause between cycles |
| **⏹ Stop** | Stop playback (keeps your repeat selection) |
| **✕** | Clear the repeat selection |
| **✓ checkbox** | Mark a part as learned |

#### Multi-part repeat
Click **🔁** on any parts you want to practice together — they don't need to be adjacent. A bar appears at the top of the parts list showing your selection. Hit **▶ Repeat** to start looping them as a sequence. The currently playing part is highlighted in green.

## Project Structure

```
learn-piano/
├── data/
│   └── songs.json        # Song data (auto-created on first save)
├── server/
│   └── index.js          # Express API (GET/PUT /api/songs)
├── src/
│   ├── components/
│   │   ├── SongList.vue      # Song library
│   │   ├── SongDetail.vue    # Song view with player and parts
│   │   ├── SongEditor.vue    # Add/edit song or part modal
│   │   ├── PartItem.vue      # Individual part row
│   │   └── YoutubePlayer.vue # YouTube IFrame wrapper
│   ├── stores/
│   │   └── songs.js          # Pinia store
│   ├── api.js                # Fetch helpers
│   └── App.vue               # Root component + URL routing
└── package.json
```

## Building for Production

```bash
npm run build
```

The compiled frontend lands in `dist/`. Serve it with any static host and point `/api` requests to the Express server.

## License

MIT
