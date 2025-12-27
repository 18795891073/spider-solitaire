<template>
  <div class="game-controls">
    <div class="controls-section">
      <h3>游戏设置</h3>
      <div class="control-item">
        <label>难度:</label>
        <select v-model="localDifficulty" @change="handleDifficultyChange">
          <option value="one-suit">单花色</option>
          <option value="two-suit">双花色</option>
          <option value="four-suit">四花色</option>
        </select>
      </div>
      <div class="control-item">
        <label>
          <input type="checkbox" v-model="autoComplete" />
          自动完成
        </label>
      </div>
      <div class="control-item">
        <label>
          <input type="checkbox" v-model="soundEnabled" />
          音效
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Difficulty } from "../types";

interface Props {
  difficulty: Difficulty;
  autoComplete: boolean;
  soundEnabled: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:difficulty": [value: Difficulty];
  "update:autoComplete": [value: boolean];
  "update:soundEnabled": [value: boolean];
}>();

const localDifficulty = ref<Difficulty>(props.difficulty);
const autoComplete = ref(props.autoComplete);
const soundEnabled = ref(props.soundEnabled);

watch(
  () => props.difficulty,
  (val: Difficulty) => {
    localDifficulty.value = val;
  }
);

watch(
  () => props.autoComplete,
  (val: boolean) => {
    autoComplete.value = val;
  }
);

watch(
  () => props.soundEnabled,
  (val: boolean) => {
    soundEnabled.value = val;
  }
);

watch(autoComplete, (val: boolean) => {
  emit("update:autoComplete", val);
});

watch(soundEnabled, (val: boolean) => {
  emit("update:soundEnabled", val);
});

function handleDifficultyChange() {
  emit("update:difficulty", localDifficulty.value);
}
</script>

<style scoped>
.game-controls {
  padding: 15px 20px;
  background: #f9f9f9;
  border-top: 1px solid #ddd;
}

.controls-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.control-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-item label {
  font-size: 14px;
  color: #666;
}

.control-item select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.control-item input[type="checkbox"] {
  margin-right: 5px;
  cursor: pointer;
}
</style>
