<template>
  <div>
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

    <YoutubePlayer :videoId="song.youtubeId" @ready="onPlayerReady" class="player" />

    <div class="parts-section">
      <div class="parts-header">
        <h3>Parts</h3>
        <button class="btn-primary btn-sm" @click="openAddPart">+ Add Part</button>
      </div>

      <p v-if="song.parts.length === 0" class="empty">No parts yet. Add some to start practicing!</p>

      <div v-if="repeatingPart" class="repeat-bar">
        <span>🔁 Repeating <strong>{{ repeatingPart.name }}</strong></span>
        <span v-if="startingIn > 0" class="countdown">starting in {{ startingIn }}…</span>
        <span v-else class="countdown playing">playing</span>
        <button class="btn-danger btn-sm" @click="stop">Stop</button>
      </div>

      <div v-else-if="startingIn > 0" class="starting-bar">
        ▶ Starting in {{ startingIn }}…
      </div>

      <div class="parts-list">
        <PartItem
          v-for="part in song.parts"
          :key="part.id"
          :part="part"
          :isActive="activePart?.id === part.id"
          :isRepeating="repeatingPart?.id === part.id"
          @play-part="playPart"
          @play-from="playFrom"
          @repeat-part="toggleRepeat"
          @toggle-learned="toggleLearned"
          @edit="openEditPart"
        />
      </div>
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
import { ref, onUnmounted } from 'vue'
import { useSongsStore } from '../stores/songs.js'
import YoutubePlayer from './YoutubePlayer.vue'
import PartItem from './PartItem.vue'
import SongEditor from './SongEditor.vue'

const props = defineProps({ song: { type: Object, required: true } })
const store = useSongsStore()

const playerApi = ref(null)
const activePart = ref(null)
const repeatingPart = ref(null)
const startingIn = ref(0)
const editorOpen = ref(false)
const editorMode = ref('song') // 'song' | 'part'
const editPartTarget = ref(null)

let delayTimeout = null
let delayInterval = null

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

function onPlayerReady(api) {
  playerApi.value = api
}

function playFullSong() {
  stop()
  withDelay(() => playerApi.value?.playFull(props.song.introSkip || 0))
}

function playPart(part) {
  stop()
  activePart.value = part
  withDelay(() => playerApi.value?.playPart(part.start, part.end))
}

function toggleRepeat(part) {
  if (repeatingPart.value?.id === part.id) {
    stop()
    return
  }
  stop()
  repeatingPart.value = part
  playWithRepeat(part)
}

function playWithRepeat(part) {
  activePart.value = part
  withDelay(() => {
    playerApi.value?.playPart(part.start, part.end, () => {
      if (repeatingPart.value?.id !== part.id) return
      playWithRepeat(part)
    })
  })
}

function stop() {
  cancelDelay()
  repeatingPart.value = null
  activePart.value = null
  playerApi.value?.stop()
}

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
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.detail-header h2 { font-size: 1.3rem; color: #c4b5fd; }
.detail-actions { display: flex; gap: 0.4rem; align-items: center; }
.skip-badge {
  margin-left: 0.35rem;
  font-size: 0.7rem;
  background: #4c1d95;
  color: #c4b5fd;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  vertical-align: middle;
}

.player { margin-bottom: 1.5rem; }

.parts-section { margin-top: 0.5rem; }
.parts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.7rem;
}
.parts-header h3 { color: #a78bfa; }
.parts-list { display: flex; flex-direction: column; gap: 0.4rem; }
.empty { color: #6b7280; margin-top: 1rem; text-align: center; }

.repeat-bar, .starting-bar {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: #1e1b4b;
  border: 1px solid #7c3aed;
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  margin-bottom: 0.7rem;
  font-size: 0.85rem;
  color: #c4b5fd;
}
.repeat-bar strong { color: #e2e8f0; }
.countdown { color: #a78bfa; margin-left: auto; }
.countdown.playing { color: #34d399; }
.starting-bar { border-color: #4c1d95; color: #a78bfa; }
</style>
