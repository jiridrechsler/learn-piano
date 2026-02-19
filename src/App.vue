<template>
  <div class="app">
    <header class="app-header">
      <span v-if="store.activeSong" class="back-btn" @click="store.setActiveSong(null)">← Songs</span>
      <h1>🎹 Learn Piano</h1>
    </header>

    <main class="app-content" :class="store.activeSong ? 'detail-mode' : 'list-mode'">
      <SongList v-if="!store.activeSong" />
      <SongDetail v-else :song="store.activeSong" />
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useSongsStore } from './stores/songs.js'
import SongList from './components/SongList.vue'
import SongDetail from './components/SongDetail.vue'

const store = useSongsStore()

function songSlug(song) {
  return song.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function setHash(song) {
  const hash = song ? `#/${song.id}/${songSlug(song)}` : ''
  history.replaceState(null, '', window.location.pathname + hash)
}

function songFromHash() {
  const id = window.location.hash.slice(1).split('/').filter(Boolean)[0]
  return id ? store.songs.find(s => s.id === id) ?? null : null
}

function onHashChange() {
  const song = songFromHash()
  if (song?.id !== store.activeSong?.id) store.setActiveSong(song)
}

watch(() => store.activeSong, (song) => {
  setHash(song)
})

onMounted(async () => {
  await store.load()
  const song = songFromHash()
  if (song) store.setActiveSong(song)
  window.addEventListener('hashchange', onHashChange)
})

onUnmounted(() => window.removeEventListener('hashchange', onHashChange))
</script>

<style>
.app {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 1.25rem;
  border-bottom: 1px solid #2d2d4e;
}
.app-header h1 { font-size: 1.2rem; color: #a78bfa; }

.back-btn {
  cursor: pointer;
  color: #7c3aed;
  font-size: 0.85rem;
  padding: 0.25rem 0.6rem;
  border: 1px solid #7c3aed;
  border-radius: 6px;
  white-space: nowrap;
}
.back-btn:hover { background: #7c3aed; color: #fff; }

.app-content {
  flex: 1;
  min-height: 0;
}
.app-content.list-mode {
  overflow-y: auto;
  padding: 1.5rem;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}
.app-content.detail-mode {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

button {
  cursor: pointer;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  transition: opacity 0.15s;
}
button:hover { opacity: 0.85; }
button:disabled { opacity: 0.4; cursor: default; }

.btn-primary { background: #7c3aed; color: #fff; }
.btn-secondary { background: #2d2d4e; color: #e0e0e0; }
.btn-danger { background: #dc2626; color: #fff; }
.btn-success { background: #16a34a; color: #fff; }
.btn-sm { padding: 0.25rem 0.6rem; font-size: 0.78rem; }
</style>
