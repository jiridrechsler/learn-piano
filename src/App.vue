<template>
  <div>
    <header class="app-header">
      <span v-if="store.activeSong" class="back-btn" @click="store.setActiveSong(null)">← Songs</span>
      <h1>🎹 Learn Piano</h1>
    </header>

    <SongList v-if="!store.activeSong" />
    <SongDetail v-else :song="store.activeSong" />
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
.app-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #2d2d4e;
}
.app-header h1 { font-size: 1.5rem; color: #a78bfa; }
.back-btn {
  cursor: pointer;
  color: #7c3aed;
  font-size: 0.9rem;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7c3aed;
  border-radius: 6px;
}
.back-btn:hover { background: #7c3aed; color: #fff; }

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
