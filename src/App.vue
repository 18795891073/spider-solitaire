<template>
  <div class="app">
    <GameHeader
      :game-state="game.gameState"
      :can-undo="game.gameState.historyIndex >= 0"
      @new-game="handleNewGame"
      @undo="handleUndo"
      @hint="handleHint"
    />

    <GameBoard
      :game-state="game.gameState"
      :hint-cards="hintCards"
      :is-dragging="dragEffect.isDragging.value"
      :is-dealing="isDealing"
      @deal-cards="handleDealCards"
      @card-mouse-down="handleCardMouseDown"
      @card-double-click="handleCardDoubleClick"
      @drop="handleDrop"
    />

    <GameControls
      :difficulty="game.gameState.difficulty"
      :auto-complete="autoComplete"
      :sound-enabled="soundEnabled"
      @update:difficulty="handleDifficultyChange"
      @update:auto-complete="autoComplete = $event"
      @update:sound-enabled="handleSoundEnabledChange"
    />

    <!-- 礼花效果 -->
    <Confetti :is-active="showConfetti" />

    <!-- 游戏胜利弹窗 -->
    <div
      v-if="game.gameState.isWon"
      class="modal-overlay"
      @click="handleVictoryModalClick"
    >
      <div class="modal-content" @click.stop>
        <h2 v-if="isMaxDifficulty">🏆 恭喜你！已完成所有难度！</h2>
        <h2 v-else>🎉 恭喜你！游戏胜利！</h2>
        <div class="game-stats">
          <p>分数: {{ game.gameState.score }}</p>
          <p>时间: {{ formatTime(game.gameState.timeElapsed) }}</p>
          <p>步数: {{ game.gameState.moves }}</p>
          <p>难度: {{ getDifficultyText(game.gameState.difficulty) }}</p>
        </div>
        <div class="modal-buttons">
          <button
            v-if="isMaxDifficulty"
            class="btn btn-primary"
            @click="handleNewGame"
          >
            再来一局当前难度
          </button>
          <button v-else class="btn btn-primary" @click="handleNextDifficulty">
            下一难度
          </button>
          <button class="btn btn-secondary" @click="handleNewGame">
            {{ isMaxDifficulty ? "选择其他难度" : "再来一局当前难度" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import GameHeader from "./components/GameHeader.vue";
import GameBoard from "./components/GameBoard.vue";
import GameControls from "./components/GameControls.vue";
import Confetti from "./components/Confetti.vue";
import { useGame } from "./composables/useGame";
import { useDragEffect } from "./composables/useDragEffect";
import { extractMovableSequence } from "./utils/cardUtils";
import { soundManager } from "./utils/soundManager";
import type { Difficulty } from "./types";

const game = useGame();
const dragEffect = useDragEffect();

const autoComplete = ref(true);
const soundEnabled = ref(true);
const hintCards = ref<Set<string>>(new Set());
const currentDragState = ref<{
  pileIndex: number;
  cardIndex: number;
} | null>(null);
const isDealing = ref(false);
const showConfetti = ref(false);

// 难度顺序
const difficultyOrder: Difficulty[] = ["one-suit", "two-suit", "four-suit"];

// 获取当前难度是否是最高难度
const isMaxDifficulty = ref(false);

/**
 * 处理新游戏
 */
function handleNewGame() {
  game.initGame(game.gameState.difficulty);
  hintCards.value.clear();
}

/**
 * 处理撤销
 */
function handleUndo() {
  game.undo();
  hintCards.value.clear();
}

/**
 * 处理提示
 */
function handleHint() {
  const hints = game.getHints();
  if (hints.length === 0) {
    alert("没有可用的移动！");
    return;
  }

  // 高亮提示的牌
  hintCards.value.clear();
  const firstHint = hints[0];
  const pile = game.gameState.tableau[firstHint.from];
  const sequence = extractMovableSequence(pile, firstHint.cardIndex);
  sequence.forEach((card) => {
    hintCards.value.add(card.id);
  });

  // 3秒后取消高亮
  setTimeout(() => {
    hintCards.value.clear();
  }, 3000);
}

/**
 * 处理发牌（带动画）
 */
async function handleDealCards() {
  if (isDealing.value) return;

  isDealing.value = true;
  soundManager.setEnabled(soundEnabled.value);

  await game.dealCards(() => {
    // 每发一张牌播放音效
    soundManager.playDealCard();
  });

  isDealing.value = false;
}

/**
 * 处理卡片鼠标按下
 */
function handleCardMouseDown(
  pileIndex: number,
  cardIndex: number,
  event: MouseEvent
) {
  const pile = game.gameState.tableau[pileIndex];
  if (cardIndex < 0 || cardIndex >= pile.length) return;

  const card = pile[cardIndex];
  if (!card.isFaceUp) return;

  // 提取可移动的序列
  const sequence = extractMovableSequence(pile, cardIndex);
  if (sequence.length === 0) return;

  // 保存拖拽状态
  currentDragState.value = { pileIndex, cardIndex };

  // 获取卡片元素
  const target = event.target as HTMLElement;
  const cardElement = target.closest(".card") as HTMLElement;

  if (cardElement) {
    // 启动拖拽视觉效果
    dragEffect.startDrag(sequence, event, cardElement);
  }

  // 添加全局鼠标事件监听
  document.addEventListener("mouseup", handleGlobalMouseUp);
  event.preventDefault();
}

/**
 * 处理卡片双击（自动移动）
 */
function handleCardDoubleClick(pileIndex: number, cardIndex: number) {
  const pile = game.gameState.tableau[pileIndex];
  if (cardIndex < 0 || cardIndex >= pile.length) return;

  soundManager.setEnabled(soundEnabled.value);

  // 尝试移动到完成区
  if (game.moveToFoundation(pileIndex, cardIndex)) {
    soundManager.playCompleteSequence();
    return;
  }

  // 尝试移动到其他列
  const sequence = extractMovableSequence(pile, cardIndex);
  if (sequence.length === 0) return;

  // 查找可以放置的位置
  for (let toCol = 0; toCol < 10; toCol++) {
    if (toCol === pileIndex) continue;
    if (game.moveCards(pileIndex, cardIndex, toCol)) {
      soundManager.playCardPlace();
      return;
    }
  }

  soundManager.playError();
}

/**
 * 处理拖放
 */
function handleDrop(_fromPile: number, toPile: number) {
  if (!currentDragState.value) return;

  const { pileIndex, cardIndex: startIndex } = currentDragState.value;

  // 检查是否是从不同的列移动
  if (pileIndex === toPile) {
    cleanupDrag();
    return;
  }

  soundManager.setEnabled(soundEnabled.value);

  // 先尝试移动到完成区（如果是完整序列）
  const sequence = extractMovableSequence(
    game.gameState.tableau[pileIndex],
    startIndex
  );
  if (sequence.length === 13 && game.moveToFoundation(pileIndex, startIndex)) {
    soundManager.playCompleteSequence();
    cleanupDrag();
    return;
  }

  // 否则移动到目标列
  if (game.moveCards(pileIndex, startIndex, toPile)) {
    soundManager.playCardPlace();
    cleanupDrag();
  } else {
    soundManager.playError();
    // 如果移动失败，也清理拖拽状态
    cleanupDrag();
  }
}

/**
 * 处理全局鼠标释放
 */
function handleGlobalMouseUp() {
  cleanupDrag();
}

/**
 * 清理拖拽状态
 */
function cleanupDrag() {
  currentDragState.value = null;
  dragEffect.cleanup();
  document.removeEventListener("mouseup", handleGlobalMouseUp);
}

/**
 * 处理难度变化
 */
function handleDifficultyChange(difficulty: Difficulty) {
  game.gameState.difficulty = difficulty;
  // 难度变化时重新开始游戏
  handleNewGame();
}

/**
 * 处理音效开关变化
 */
function handleSoundEnabledChange(enabled: boolean) {
  soundEnabled.value = enabled;
  soundManager.setEnabled(enabled);
  if (enabled) {
    soundManager.playClick();
  }
}

/**
 * 格式化时间
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

// 获取难度文本
function getDifficultyText(difficulty: Difficulty): string {
  const map = {
    "one-suit": "单花色",
    "two-suit": "双花色",
    "four-suit": "四花色",
  };
  return map[difficulty];
}

// 获取下一个难度
function getNextDifficulty(current: Difficulty): Difficulty | null {
  const currentIndex = difficultyOrder.indexOf(current);
  if (currentIndex === -1 || currentIndex === difficultyOrder.length - 1) {
    return null;
  }
  return difficultyOrder[currentIndex + 1];
}

// 处理下一难度
function handleNextDifficulty() {
  const nextDifficulty = getNextDifficulty(game.gameState.difficulty);
  if (nextDifficulty) {
    game.gameState.difficulty = nextDifficulty;
    handleNewGame();
  }
}

// 处理胜利弹窗点击
function handleVictoryModalClick() {
  // 如果是最高难度，点击背景不关闭弹窗，需要点击按钮
  if (!isMaxDifficulty.value) {
    handleNextDifficulty();
  }
}

// 监听游戏胜利
watch(
  () => game.gameState.isWon,
  (isWon) => {
    if (isWon) {
      soundManager.setEnabled(soundEnabled.value);
      soundManager.playWin();

      // 显示礼花效果
      showConfetti.value = true;
      setTimeout(() => {
        showConfetti.value = false;
      }, 3000);

      // 检查是否是最高难度
      const nextDifficulty = getNextDifficulty(game.gameState.difficulty);
      isMaxDifficulty.value = nextDifficulty === null;

      // 如果不是最高难度，3秒后自动进入下一难度
      if (!isMaxDifficulty.value) {
        setTimeout(() => {
          handleNextDifficulty();
        }, 3000);
      }
    }
  }
);

onMounted(() => {
  game.initGame("four-suit");
  soundManager.setEnabled(soundEnabled.value);
  // 初始化音频上下文（需要用户交互）
  document.addEventListener(
    "click",
    () => {
      soundManager.init();
    },
    { once: true }
  );
});

onUnmounted(() => {
  game.stopTimer();
  document.removeEventListener("mouseup", handleGlobalMouseUp);
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  padding: 20px;
}

.app {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 28px;
}

.game-stats {
  margin: 20px 0;
}

.game-stats p {
  font-size: 18px;
  margin: 10px 0;
  color: #666;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  margin-top: 20px;
}

.btn-primary {
  background: #4caf50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
}
</style>
