<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <!-- Song editor -->
      <template v-if="!songId || song">
        <h3>{{ song ? 'Edit Song' : 'Add Song' }}</h3>
        <label>Title
          <input v-model="form.title" placeholder="Song title" />
        </label>
        <label>YouTube URL or Video ID
          <input v-model="form.youtubeUrl" placeholder="https://youtube.com/watch?v=... or video ID" />
        </label>
        <label>Skip intro (seconds)
          <input v-model.number="form.introSkip" type="number" min="0" placeholder="0 = no skip" />
          <span class="field-hint">▶ Full Song will start here instead of t=0</span>
        </label>
        <div class="preview-link" v-if="extractedId">
          <a :href="`https://www.youtube.com/watch?v=${extractedId}`" target="_blank">Preview on YouTube ↗</a>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="$emit('close')">Cancel</button>
          <button class="btn-danger" v-if="song" @click="deleteSong">Delete Song</button>
          <button class="btn-primary" @click="saveSong" :disabled="!form.title || !extractedId">Save</button>
        </div>
      </template>

      <!-- Part editor -->
      <template v-else>
        <h3>{{ editPart ? 'Edit Part' : 'Add Part' }}</h3>
        <label>Part Name
          <input v-model="partForm.name" placeholder="e.g. Intro, Theme A" />
        </label>
        <div class="time-row">
          <label>Start (seconds)
            <input v-model.number="partForm.start" type="number" min="0" placeholder="0" />
          </label>
          <label>End (seconds)
            <input v-model.number="partForm.end" type="number" min="0" placeholder="30" />
          </label>
        </div>
        <label>Notes (optional)
          <textarea v-model="partForm.notes" rows="2" placeholder="Practice tips, fingering, etc."></textarea>
        </label>
        <div class="modal-footer">
          <button class="btn-secondary" @click="$emit('close')">Cancel</button>
          <button class="btn-danger" v-if="editPart" @click="deletePart">Delete Part</button>
          <button class="btn-primary" @click="savePart" :disabled="!partForm.name || partForm.end <= partForm.start">Save</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useSongsStore } from '../stores/songs.js'

const props = defineProps({
  song: { type: Object, default: null },      // null = add song mode
  songId: { type: String, default: null },    // set when editing a part
  editPart: { type: Object, default: null }   // null = add part mode
})
const emit = defineEmits(['close'])
const store = useSongsStore()

// ----- Song form -----
const form = ref({
  title: props.song?.title ?? '',
  youtubeUrl: props.song?.youtubeId ?? '',
  introSkip: props.song?.introSkip ?? 0
})

const extractedId = computed(() => {
  const val = form.value.youtubeUrl.trim()
  const match = val.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)
  if (match) return match[1]
  if (/^[A-Za-z0-9_-]{11}$/.test(val)) return val
  return null
})

function saveSong() {
  if (!form.value.title || !extractedId.value) return
  const introSkip = form.value.introSkip > 0 ? form.value.introSkip : 0
  if (props.song) {
    store.updateSong({ ...props.song, title: form.value.title, youtubeId: extractedId.value, introSkip })
  } else {
    store.addSong({ id: uuidv4(), title: form.value.title, youtubeId: extractedId.value, introSkip, parts: [] })
  }
  emit('close')
}

function deleteSong() {
  if (confirm(`Delete "${props.song.title}"?`)) {
    store.deleteSong(props.song.id)
    emit('close')
  }
}

// ----- Part form -----
const partForm = ref({
  name: props.editPart?.name ?? '',
  start: props.editPart?.start ?? 0,
  end: props.editPart?.end ?? 30,
  notes: props.editPart?.notes ?? ''
})

function savePart() {
  const song = store.songs.find(s => s.id === props.songId)
  if (!song) return

  let updatedParts
  if (props.editPart) {
    updatedParts = song.parts.map(p =>
      p.id === props.editPart.id ? { ...p, ...partForm.value } : p
    )
  } else {
    updatedParts = [...song.parts, { id: uuidv4(), learned: false, ...partForm.value }]
  }
  store.updateSong({ ...song, parts: updatedParts })
  emit('close')
}

function deletePart() {
  const song = store.songs.find(s => s.id === props.songId)
  if (!song) return
  if (confirm(`Delete part "${props.editPart.name}"?`)) {
    store.updateSong({ ...song, parts: song.parts.filter(p => p.id !== props.editPart.id) })
    emit('close')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: #16213e;
  border: 1px solid #2d2d4e;
  border-radius: 12px;
  padding: 1.5rem;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.modal h3 { color: #c4b5fd; font-size: 1.1rem; margin-bottom: 0.2rem; }
label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.85rem; color: #9ca3af; }
input, textarea {
  background: #0f172a;
  border: 1px solid #2d2d4e;
  border-radius: 6px;
  color: #e2e8f0;
  padding: 0.5rem 0.7rem;
  font-size: 0.9rem;
  outline: none;
  width: 100%;
}
input:focus, textarea:focus { border-color: #7c3aed; }
.time-row { display: flex; gap: 0.8rem; }
.time-row label { flex: 1; }
.field-hint { font-size: 0.75rem; color: #6b7280; margin-top: 0.15rem; }
.preview-link { font-size: 0.8rem; }
.preview-link a { color: #7c3aed; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.3rem; }
</style>
