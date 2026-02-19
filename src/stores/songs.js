import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchSongs, saveSongs } from '../api.js'

export const useSongsStore = defineStore('songs', () => {
  const songs = ref([])
  const activeSong = ref(null)

  async function load() {
    const data = await fetchSongs()
    songs.value = data.songs
  }

  async function save() {
    await saveSongs(songs.value)
  }

  function setActiveSong(song) {
    activeSong.value = song
  }

  function addSong(song) {
    songs.value.push(song)
    save()
  }

  function updateSong(updated) {
    const idx = songs.value.findIndex(s => s.id === updated.id)
    if (idx !== -1) {
      songs.value[idx] = updated
      if (activeSong.value?.id === updated.id) activeSong.value = updated
    }
    save()
  }

  function deleteSong(id) {
    songs.value = songs.value.filter(s => s.id !== id)
    if (activeSong.value?.id === id) activeSong.value = null
    save()
  }

  return { songs, activeSong, load, save, setActiveSong, addSong, updateSong, deleteSong }
})
