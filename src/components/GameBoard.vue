<template>
  <div class="game-board">
    <!-- 完成区 -->
    <div class="foundation-area">
      <FoundationPile
        v-for="(pile, index) in gameState.foundation"
        :key="index"
        :pile="pile"
      />
    </div>

    <!-- 游戏区域 -->
    <div class="game-area">
      <!-- 发牌堆 -->
      <div class="stock-area">
        <StockPile
          :cards="gameState.stock"
          :is-dealing="props.isDealing"
          @click="$emit('dealCards')"
        />
      </div>

      <!-- 10列牌堆 -->
      <div class="tableau-area">
        <TableauPile
          v-for="(pile, index) in gameState.tableau"
          :key="index"
          :pile="pile"
          :pile-index="index"
          :dragging-card="draggingCard"
          :hint-cards="hintCards"
          :is-dragging="props.isDragging"
          @card-mouse-down="(cardIndex: number, e: MouseEvent) => handleCardMouseDown(index, cardIndex, e)"
          @card-double-click="(cardIndex: number, e: MouseEvent) => handleCardDoubleClick(index, cardIndex, e)"
          @drop="(targetIndex: number) => handleDrop(targetIndex, index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import TableauPile from "./TableauPile.vue";
import StockPile from "./StockPile.vue";
import FoundationPile from "./FoundationPile.vue";
import type { GameState, Card } from "../types";

interface Props {
  gameState: GameState;
  hintCards?: Set<string>;
  isDragging: boolean;
  isDealing: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hintCards: () => new Set<string>(),
  isDragging: false,
  isDealing: false,
});

const emit = defineEmits<{
  dealCards: [];
  cardMouseDown: [pileIndex: number, cardIndex: number, event: MouseEvent];
  cardDoubleClick: [pileIndex: number, cardIndex: number, event: MouseEvent];
  drop: [fromPile: number, toPile: number];
}>();

const draggingCard = ref<Card | null>(null);

function handleCardMouseDown(
  pileIndex: number,
  cardIndex: number,
  event: MouseEvent
) {
  emit("cardMouseDown", pileIndex, cardIndex, event);
}

function handleCardDoubleClick(
  pileIndex: number,
  cardIndex: number,
  event: MouseEvent
) {
  emit("cardDoubleClick", pileIndex, cardIndex, event);
}

function handleDrop(fromPile: number, toPile: number) {
  emit("drop", fromPile, toPile);
}
</script>

<style scoped>
.game-board {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.foundation-area {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.game-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stock-area {
  display: flex;
  justify-content: flex-end;
  padding-right: 10px;
}

.tableau-area {
  display: flex;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
}
</style>
