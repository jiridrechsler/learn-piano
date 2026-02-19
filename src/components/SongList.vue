<template>
  <div>
    <div class="list-header">
      <h2>My Songs</h2>
      <button class="btn-primary" @click="openAdd">+ Add Song</button>
    </div>

    <p v-if="store.songs.length === 0" class="empty">No songs yet. Add one to get started!</p>

    <ul class="song-list">
      <li v-for="song in store.songs" :key="song.id" class="song-item">
        <div class="song-info" @click="store.setActiveSong(song)">
          <span class="song-title">{{ song.title }}</span>
          <span class="song-meta">{{ song.parts.length }} part{{ song.parts.length !== 1 ? 's' : '' }} · {{ learnedCount(song) }}/{{ song.parts.length }} learned</span>
        </div>
        <div class="song-actions">
          <button class="btn-secondary btn-sm" @click.stop="openEdit(song)">Edit</button>
          <button class="btn-danger btn-sm" @click.stop="removeSong(song.id)">Delete</button>
        </div>
      </li>
    </ul>

    <SongEditor v-if="editorOpen" :song="editTarget" @close="editorOpen = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSongsStore } from '../stores/songs.js'
import SongEditor from './SongEditor.vue'

const store = useSongsStore()
const editorOpen = ref(false)
const editTarget = ref(null)

function learnedCount(song) {
  return song.parts.filter(p => p.learned).length
}

function openAdd() {
  editTarget.value = null
  editorOpen.value = true
}

function openEdit(song) {
  editTarget.value = song
  editorOpen.value = true
}

function removeSong(id) {
  if (confirm('Delete this song?')) store.deleteSong(id)
}
</script>

<style scoped>
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.list-header h2 { font-size: 1.2rem; color: #c4b5fd; }
.empty { color: #6b7280; margin-top: 2rem; text-align: center; }
.song-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #16213e;
  border: 1px solid #2d2d4e;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  transition: border-color 0.15s;
}
.song-item:hover { border-color: #7c3aed; }
.song-info { flex: 1; cursor: pointer; }
.song-title { display: block; font-weight: 600; color: #e2e8f0; }
.song-meta { font-size: 0.8rem; color: #6b7280; }
.song-actions { display: flex; gap: 0.4rem; }
</style>
