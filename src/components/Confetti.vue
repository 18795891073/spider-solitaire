<template>
  <div v-if="isActive" class="confetti-container">
    <div
      v-for="(confetti, index) in confettiPieces"
      :key="index"
      class="confetti-piece"
      :style="confetti.style"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  isActive: boolean;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 3000,
});

interface ConfettiPiece {
  style: {
    left: string;
    animationDelay: string;
    backgroundColor: string;
    transform: string;
  };
}

const confettiPieces = ref<ConfettiPiece[]>([]);

// 礼花颜色
const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#f0932b", "#eb4d4b", "#6c5ce7", "#a29bfe"];

function createConfetti() {
  const pieces: ConfettiPiece[] = [];
  const pieceCount = 100;

  for (let i = 0; i < pieceCount; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const rotation = Math.random() * 360;

    pieces.push({
      style: {
        left: `${left}%`,
        animationDelay: `${delay}s`,
        backgroundColor: color,
        transform: `rotate(${rotation}deg)`,
      },
    });
  }

  confettiPieces.value = pieces;
}

watch(() => props.isActive, (active) => {
  if (active) {
    createConfetti();
    // 3秒后清除礼花
    setTimeout(() => {
      confettiPieces.value = [];
    }, props.duration);
  }
});
</script>

<style scoped>
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  width: 12px;
  height: 12px;
  top: -12px;
  animation: confetti-fall 3s linear forwards;
  border-radius: 2px;
}

.confetti-piece:nth-child(3n) {
  border-radius: 50%;
}

.confetti-piece:nth-child(3n + 1) {
  border-radius: 0;
  transform: rotate(45deg);
}

.confetti-piece:nth-child(3n + 2) {
  width: 8px;
  height: 16px;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
</style>

