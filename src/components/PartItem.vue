<template>
  <div class="part-item" :class="{ learned: part.learned, active: isActive }">
    <label class="learned-check" :title="part.learned ? 'Mark as not learned' : 'Mark as learned'">
      <input type="checkbox" :checked="part.learned" @change="toggleLearned" />
      <span class="checkmark">{{ part.learned ? '✓' : '' }}</span>
    </label>

    <div class="part-info">
      <span class="part-name">{{ part.name }}</span>
      <span class="part-time">{{ fmt(part.start) }} – {{ fmt(part.end) }}</span>
    </div>

    <div class="part-notes" v-if="part.notes">
      <span class="notes-text">{{ part.notes }}</span>
    </div>

    <div class="part-actions">
      <button class="btn-primary btn-sm" @click="$emit('play-part', part)">▶ Part</button>
      <button class="btn-secondary btn-sm" @click="$emit('play-from', part)">▶ From here</button>
      <button class="btn-secondary btn-sm" @click="$emit('edit', part)">Edit</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  part: { type: Object, required: true },
  isActive: { type: Boolean, default: false }
})
const emit = defineEmits(['toggle-learned', 'play-part', 'play-from', 'edit'])

function fmt(sec) {
  const m = Math.floor(sec / 60)
  const s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

function toggleLearned() {
  emit('toggle-learned', props.part)
}
</script>

<style scoped>
.part-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: #16213e;
  border: 1px solid #2d2d4e;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  transition: border-color 0.15s;
  flex-wrap: wrap;
}
.part-item.active { border-color: #7c3aed; background: #1e1b4b; }
.part-item.learned { opacity: 0.6; }

.learned-check { cursor: pointer; flex-shrink: 0; }
.learned-check input { display: none; }
.checkmark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 2px solid #7c3aed;
  border-radius: 4px;
  color: #7c3aed;
  font-weight: bold;
  font-size: 0.85rem;
}

.part-info { flex: 1; min-width: 120px; }
.part-name { display: block; font-weight: 600; font-size: 0.9rem; }
.part-time { font-size: 0.75rem; color: #6b7280; }

.part-notes { flex: 2; font-size: 0.8rem; color: #9ca3af; font-style: italic; }

.part-actions { display: flex; gap: 0.3rem; flex-shrink: 0; }
</style>
