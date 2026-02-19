<template>
  <div class="yt-wrapper">
    <div :id="playerId"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({ videoId: { type: String, required: true } })
const emit = defineEmits(['ready'])

const playerId = `yt-player-${Math.random().toString(36).slice(2)}`
let player = null
let stopInterval = null

function loadYTApi() {
  return new Promise(resolve => {
    if (window.YT && window.YT.Player) { resolve(); return }
    const existing = document.querySelector('script[src*="youtube.com/iframe_api"]')
    if (!existing) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev()
      resolve()
    }
  })
}

onMounted(async () => {
  await loadYTApi()
  player = new window.YT.Player(playerId, {
    height: '100%',
    width: '100%',
    videoId: props.videoId,
    playerVars: { rel: 0, modestbranding: 1 },
    events: {
      onReady: () => emit('ready', api)
    }
  })
})

watch(() => props.videoId, newId => {
  clearInterval(stopInterval)
  player?.loadVideoById(newId)
})

onUnmounted(() => {
  clearInterval(stopInterval)
  player?.destroy()
  player = null
})

const api = {
  seekTo(t) { player?.seekTo(t, true) },
  play() { player?.playVideo() },
  pause() { player?.pauseVideo() },
  getCurrentTime() { return player?.getCurrentTime() ?? 0 },
  getState() { return player?.getPlayerState() },

  playPart(start, end, onEnd) {
    clearInterval(stopInterval)
    player?.seekTo(start, true)
    player?.playVideo()
    stopInterval = setInterval(() => {
      const cur = player?.getCurrentTime() ?? 0
      if (cur >= end) {
        player?.pauseVideo()
        clearInterval(stopInterval)
        if (onEnd) onEnd()
      }
    }, 250)
  },

  playFull(start = 0) {
    clearInterval(stopInterval)
    player?.seekTo(start, true)
    player?.playVideo()
  },

  stop() {
    clearInterval(stopInterval)
    player?.pauseVideo()
  }
}
</script>

<style scoped>
.yt-wrapper {
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}
.yt-wrapper > div { width: 100%; height: 100%; }
</style>
