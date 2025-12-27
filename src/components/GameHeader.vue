<template>
  <div class="game-header">
    <div class="header-left">
      <div class="score-section">
        <span class="label">分数:</span>
        <span class="value">{{ gameState.score }}</span>
      </div>
      <div class="timer-section">
        <span class="label">时间:</span>
        <span class="value">{{ formatTime(gameState.timeElapsed) }}</span>
      </div>
      <div class="moves-section">
        <span class="label">步数:</span>
        <span class="value">{{ gameState.moves }}</span>
      </div>
    </div>

    <div class="header-right">
      <button class="btn btn-primary" @click="$emit('newGame')">新游戏</button>
      <button
        class="btn btn-secondary"
        @click="$emit('undo')"
        :disabled="!canUndo"
      >
        撤销
      </button>
      <button class="btn btn-secondary" @click="$emit('hint')">提示</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameState } from "../types";

interface Props {
  gameState: GameState;
  canUndo: boolean;
}

defineProps<Props>();

defineEmits<{
  newGame: [];
  undo: [];
  hint: [];
}>();

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}
</script>

<style scoped>
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f5f5f5;
  border-bottom: 2px solid #ddd;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  gap: 30px;
  align-items: center;
}

.score-section,
.timer-section,
.moves-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-right {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-primary {
  background: #4caf50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-secondary {
  background: #2196f3;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #1976d2;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
