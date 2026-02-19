# 🎹 Learn Piano

A focused practice tool for learning piano songs from YouTube. Break any song into named sections, loop them until you nail it, and track what you've learned.

![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)

## Features

- **Add any song** via YouTube URL or video ID
- **Split into parts** — define named sections with start/end timestamps (e.g. Intro, Theme A, Bridge)
- **Loop a part** — auto-repeat with a 5-second pause between loops so you can reset your hands
- **Play from here** — chain all parts from a selected one to the end
- **Skip intro** — set an offset so "Full Song" starts where the music actually begins
- **Track progress** — mark individual parts as learned
- **Persistent URL** — the current song is saved in the URL, so refreshing keeps you in place

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
1. Open a song and click **+ Add Part**
2. Give the part a name (auto-filled as "Part 1", "Part 2", etc.)
3. Set the **Start** and **End** timestamps in seconds
4. Add optional practice notes
5. Click **Save**

### Practicing
| Button | Action |
|--------|--------|
| **▶ Part** | Play just this section |
| **▶ From here** | Play this and all following parts in sequence |
| **🔁** | Loop this part — pauses 5 seconds between each repeat so you can get ready |
| **⏹ Stop** | Stop playback |
| **✓ checkbox** | Mark a part as learned |

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
