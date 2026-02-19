<template>
  <div>
    <div class="detail-header">
      <h2>{{ song.title }}</h2>
      <div class="detail-actions">
        <button class="btn-secondary btn-sm" @click="playerApi?.playFull(song.introSkip || 0)">
          ▶ Full Song<span v-if="song.introSkip" class="skip-badge">+{{ song.introSkip }}s</span>
        </button>
        <button class="btn-secondary btn-sm" @click="playerApi?.stop()">⏹ Stop</button>
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

      <div class="parts-list">
        <PartItem
          v-for="part in song.parts"
          :key="part.id"
          :part="part"
          :isActive="activePart?.id === part.id"
          @play-part="playPart"
          @play-from="playFrom"
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
import { ref } from 'vue'
import { useSongsStore } from '../stores/songs.js'
import YoutubePlayer from './YoutubePlayer.vue'
import PartItem from './PartItem.vue'
import SongEditor from './SongEditor.vue'

const props = defineProps({ song: { type: Object, required: true } })
const store = useSongsStore()

const playerApi = ref(null)
const activePart = ref(null)
const editorOpen = ref(false)
const editorMode = ref('song') // 'song' | 'part'
const editPartTarget = ref(null)

function onPlayerReady(api) {
  playerApi.value = api
}

function playPart(part) {
  activePart.value = part
  playerApi.value?.playPart(part.start, part.end)
}

function playFrom(startPart) {
  const parts = props.song.parts
  const idx = parts.findIndex(p => p.id === startPart.id)
  if (idx === -1) return
  playSequence(parts.slice(idx))
}

function playSequence(parts) {
  if (parts.length === 0) { activePart.value = null; return }
  const [head, ...tail] = parts
  activePart.value = head
  playerApi.value?.playPart(head.start, head.end, () => {
    if (tail.length > 0) playSequence(tail)
    else activePart.value = null
  })
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
</style>
