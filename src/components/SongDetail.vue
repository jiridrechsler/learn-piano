<template>
  <div class="song-detail">

    <div class="detail-header">
      <h2>{{ song.title }}</h2>
      <div class="detail-actions">
        <button class="btn-secondary btn-sm" @click="playFullSong">
          ▶ Full Song<span v-if="song.introSkip" class="skip-badge">+{{ song.introSkip }}s</span>
        </button>
        <button class="btn-secondary btn-sm" @click="stop">⏹ Stop</button>
        <button class="btn-secondary btn-sm" @click="openEditor">Edit Song</button>
      </div>
    </div>

    <div class="main-area">

      <!-- Video pane -->
      <div class="video-pane">
        <YoutubePlayer :videoId="song.youtubeId" @ready="onPlayerReady" />
        <transition name="fade">
          <div v-if="startingIn > 0" class="countdown-overlay">
            <div class="countdown-ring">
              <span class="countdown-number">{{ startingIn }}</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>Parts</h3>
          <div class="sidebar-header-actions">
            <button class="btn-secondary btn-sm" @click="autoSplitParts" title="Auto-divide song into 30s parts">Auto 30s</button>
            <button class="btn-primary btn-sm" @click="openAddPart">+ Add Part</button>
          </div>
        </div>

        <!-- Repeat selection / status bar -->
        <div v-if="selectedIds.length > 0" class="repeat-bar" :class="{ active: isRepeating }">
          <span class="rep-label">🔁 {{ selectionLabel }}</span>
          <template v-if="isRepeating">
            <span class="rep-status" :class="startingIn > 0 ? 'waiting' : 'playing'">
              {{ startingIn > 0 ? `in ${startingIn}s` : 'playing' }}
            </span>
            <button class="btn-danger btn-sm" @click="stopRepeat">Stop</button>
          </template>
          <template v-else>
            <button class="btn-primary btn-sm" @click="startRepeat">▶ Repeat</button>
          </template>
          <button class="btn-clear" @click="clearSelection" title="Clear selection">✕</button>
        </div>

        <p v-if="song.parts.length === 0" class="empty">No parts yet. Add some to start practicing!</p>

        <div class="parts-list">
          <PartItem
            v-for="part in song.parts"
            :key="part.id"
            :part="part"
            :isActive="activePart?.id === part.id"
            :isRepeating="selectedIds.includes(part.id)"
            @play-part="playPart"
            @play-from="playFrom"
            @repeat-part="toggleSelect"
            @toggle-learned="toggleLearned"
            @edit="openEditPart"
          />
        </div>
      </aside>

    </div>

    <SongEditor
      v-if="editorOpen"
      :song="editorMode === 'song' ? song : null"
      :editPart="editorMode === 'part' ? editPartTarget : null"
      :songId="song.id"
      @close="editorOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useSongsStore } from '../stores/songs.js'
import YoutubePlayer from './YoutubePlayer.vue'
import PartItem from './PartItem.vue'
import SongEditor from './SongEditor.vue'

const props = defineProps({ song: { type: Object, required: true } })
const store = useSongsStore()

const playerApi = ref(null)
const activePart = ref(null)
const selectedIds = ref([])   // part IDs queued for repeat
const isRepeating = ref(false)
const startingIn = ref(0)
const editorOpen = ref(false)
const editorMode = ref('song')
const editPartTarget = ref(null)

let delayTimeout = null
let delayInterval = null

// ── Delay / countdown ─────────────────────────────────────────────────────

function withDelay(fn) {
  cancelDelay()
  startingIn.value = 5
  delayInterval = setInterval(() => {
    startingIn.value--
    if (startingIn.value <= 0) clearInterval(delayInterval)
  }, 1000)
  delayTimeout = setTimeout(() => {
    startingIn.value = 0
    fn()
  }, 5000)
}

function cancelDelay() {
  clearInterval(delayInterval)
  clearTimeout(delayTimeout)
  startingIn.value = 0
}

onUnmounted(() => cancelDelay())

// ── Player ready ───────────────────────────────────────────────────────────

function onPlayerReady(api) {
  playerApi.value = api
}

// ── Single-part / full-song play ───────────────────────────────────────────

function playFullSong() {
  stop()
  withDelay(() => playerApi.value?.playFull(props.song.introSkip || 0))
}

function playPart(part) {
  stop()
  activePart.value = part
  withDelay(() => playerApi.value?.playPart(part.start, part.end))
}

function stop() {
  isRepeating.value = false
  cancelDelay()
  activePart.value = null
  playerApi.value?.stop()
  // Note: keeps selectedIds so user can restart repeat easily
}

// ── Multi-part repeat selection ────────────────────────────────────────────

const selectionLabel = computed(() => {
  const selected = props.song.parts.filter(p => selectedIds.value.includes(p.id))
  if (selected.length === 0) return ''
  if (selected.length <= 3) return selected.map(p => p.name).join(', ')
  return `${selected[0].name} +${selected.length - 1} more`
})

function toggleSelect(part) {
  const idx = selectedIds.value.indexOf(part.id)
  if (idx === -1) {
    selectedIds.value.push(part.id)
  } else {
    selectedIds.value.splice(idx, 1)
    if (isRepeating.value) stopRepeat()
  }
}

function clearSelection() {
  stopRepeat()
  selectedIds.value = []
}

// ── Repeat loop ────────────────────────────────────────────────────────────

function startRepeat() {
  if (!selectedIds.value.length) return
  isRepeating.value = true
  runRepeatCycle()
}

function stopRepeat() {
  isRepeating.value = false
  cancelDelay()
  activePart.value = null
  playerApi.value?.stop()
}

function runRepeatCycle() {
  if (!isRepeating.value) return
  // Resolve current selection in song order
  const parts = props.song.parts.filter(p => selectedIds.value.includes(p.id))
  if (!parts.length) { stopRepeat(); return }
  activePart.value = parts[0]  // highlight first part during the countdown
  withDelay(() => runRepeatPart(parts, 0))
}

function runRepeatPart(parts, index) {
  if (!isRepeating.value) return
  const part = parts[index]
  activePart.value = part
  playerApi.value?.playPart(part.start, part.end, () => {
    if (!isRepeating.value) return
    if (index + 1 < parts.length) {
      runRepeatPart(parts, index + 1)  // next part in same cycle — no delay
    } else {
      runRepeatCycle()                 // cycle done — restart with 5s delay
    }
  })
}

// ── Play from / sequence ───────────────────────────────────────────────────

function playFrom(startPart) {
  stop()
  const parts = props.song.parts
  const idx = parts.findIndex(p => p.id === startPart.id)
  if (idx === -1) return
  playSequence(parts.slice(idx), true)
}

function playSequence(parts, withStartDelay = false) {
  if (parts.length === 0) { activePart.value = null; return }
  const [head, ...tail] = parts
  activePart.value = head
  const startHead = () => {
    playerApi.value?.playPart(head.start, head.end, () => {
      if (tail.length > 0) playSequence(tail)
      else activePart.value = null
    })
  }
  if (withStartDelay) withDelay(startHead)
  else startHead()
}

// ── Auto-split ─────────────────────────────────────────────────────────────

function autoSplitParts() {
  const duration = Math.floor(playerApi.value?.getDuration() ?? 0)
  if (!duration) {
    alert('Video duration not available yet — wait for the video to load.')
    return
  }
  if (props.song.parts.length > 0 && !confirm(`Replace ${props.song.parts.length} existing part(s) with auto 30s parts?`)) return

  const start = props.song.introSkip || 0
  const parts = []
  let t = start
  let i = 1
  while (t < duration) {
    parts.push({ id: uuidv4(), name: `Part ${i}`, start: t, end: Math.min(t + 30, duration), learned: false, notes: '' })
    t += 30
    i++
  }
  selectedIds.value = []
  isRepeating.value = false
  store.updateSong({ ...props.song, parts })
}

// ── Learned / editor ──────────────────────────────────────────────────────

function toggleLearned(part) {
  const updatedParts = props.song.parts.map(p =>
    p.id === part.id ? { ...p, learned: !p.learned } : p
  )
  store.updateSong({ ...props.song, parts: updatedParts })
}

function openEditor() {
  editorMode.value = 'song'
  editPartTarget.value = null
  editorOpen.value = true
}

function openAddPart() {
  editorMode.value = 'part'
  editPartTarget.value = null
  editorOpen.value = true
}

function openEditPart(part) {
  editorMode.value = 'part'
  editPartTarget.value = part
  editorOpen.value = true
}
</script>

<style scoped>
.song-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ── Header bar ───────────────────────────────── */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #2d2d4e;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.detail-header h2 { font-size: 1.1rem; color: #c4b5fd; }
.detail-actions { display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }
.skip-badge {
  margin-left: 0.35rem;
  font-size: 0.7rem;
  background: #4c1d95;
  color: #c4b5fd;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  vertical-align: middle;
}

/* ── Main split area ──────────────────────────── */
.main-area {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

/* ── Video pane ───────────────────────────────── */
.video-pane {
  flex: 1;
  min-width: 0;
  position: relative;
  background: #000;
}

/* ── Countdown overlay ────────────────────────── */
.countdown-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  z-index: 10;
}
.countdown-ring {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 4px solid #7c3aed;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(124, 58, 237, 0.15);
  box-shadow: 0 0 40px rgba(124, 58, 237, 0.4);
  animation: pulse 1s ease-in-out infinite;
}
.countdown-number {
  font-size: 4.5rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(124, 58, 237, 0.4); }
  50%       { transform: scale(1.06); box-shadow: 0 0 60px rgba(124, 58, 237, 0.7); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Sidebar ──────────────────────────────────── */
.sidebar {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #2d2d4e;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid #2d2d4e;
  flex-shrink: 0;
  gap: 0.5rem;
}
.sidebar-header h3 { color: #a78bfa; font-size: 0.95rem; }
.sidebar-header-actions { display: flex; gap: 0.35rem; }

/* ── Repeat bar ───────────────────────────────── */
.repeat-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.75rem;
  background: #1a1a3e;
  border-bottom: 1px solid #4c1d95;
  font-size: 0.82rem;
  color: #c4b5fd;
  flex-shrink: 0;
}
.repeat-bar.active {
  background: #1e1b4b;
  border-bottom-color: #7c3aed;
}
.rep-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rep-status { font-size: 0.78rem; white-space: nowrap; }
.rep-status.waiting { color: #a78bfa; }
.rep-status.playing { color: #34d399; }

.btn-clear {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.8rem;
  padding: 0.15rem 0.3rem;
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;
}
.btn-clear:hover { color: #e2e8f0; background: rgba(255,255,255,0.08); opacity: 1; }

/* ── Parts list ───────────────────────────────── */
.parts-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.empty { color: #6b7280; padding: 1.5rem; text-align: center; font-size: 0.85rem; }

/* ── Responsive ───────────────────────────────── */
@media (max-width: 768px) {
  .main-area {
    flex-direction: column;
    overflow-y: auto;
  }
  .video-pane {
    aspect-ratio: 16 / 9;
    flex: none;
    width: 100%;
  }
  .sidebar {
    width: 100%;
    border-left: none;
    border-top: 1px solid #2d2d4e;
    flex: none;
    max-height: 55vh;
    overflow-y: auto;
  }
}
</style>
