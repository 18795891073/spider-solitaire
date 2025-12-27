import { reactive } from 'vue'
import type { GameState, MoveHistory, Difficulty, Card as CardType } from '../types'
import {
  createDeck,
  shuffleDeck,
  extractMovableSequence,
  canPlaceOnTableau,
  canPlaceOnFoundation
} from '../utils/cardUtils'

const MAX_HISTORY = 50

/**
 * 游戏核心逻辑组合式函数
 */
export function useGame() {
  // 游戏状态
  const gameState = reactive<GameState>({
    stock: [],
    tableau: Array(10).fill(null).map(() => []),
    foundation: Array(8).fill(null).map(() => []),
    score: 500,
    timeElapsed: 0,
    moves: 0,
    isGameOver: false,
    isWon: false,
    difficulty: 'four-suit',
    history: [],
    historyIndex: -1
  })

  // 计时器
  let timer: number | null = null

  /**
   * 初始化游戏
   */
  function initGame(difficulty: Difficulty = 'four-suit') {
    // 重置游戏状态
    gameState.difficulty = difficulty
    gameState.stock = []
    gameState.tableau = Array(10).fill(null).map(() => [])
    gameState.foundation = Array(8).fill(null).map(() => [])
    gameState.score = 500
    gameState.timeElapsed = 0
    gameState.moves = 0
    gameState.isGameOver = false
    gameState.isWon = false
    gameState.history = []
    gameState.historyIndex = -1

    // 创建两副牌
    const deck1 = createDeck()
    const deck2 = createDeck()
    let allCards = shuffleDeck([...deck1, ...deck2])

    // 根据难度筛选牌
    if (difficulty === 'one-suit') {
      // 只使用黑桃
      allCards = allCards.filter(card => card.suit === 'spades')
    } else if (difficulty === 'two-suit') {
      // 只使用红心和黑桃
      allCards = allCards.filter(card => card.suit === 'hearts' || card.suit === 'spades')
    }

    // 重新洗牌
    allCards = shuffleDeck(allCards)

    // 根据难度调整初始发牌数量
    let cardsPerColumn: number[]
    if (difficulty === 'one-suit') {
      // 单花色：只有26张，前4列每列4张，后6列每列3张 = 4*4 + 6*3 = 16 + 18 = 34张（但只有26张，所以调整为前4列每列3张，后6列每列2张 = 4*3 + 6*2 = 12 + 12 = 24张）
      cardsPerColumn = [3, 3, 3, 3, 2, 2, 2, 2, 2, 2]
    } else if (difficulty === 'two-suit') {
      // 双花色：有52张，前4列每列5张，后6列每列4张 = 4*5 + 6*4 = 20 + 24 = 44张
      cardsPerColumn = [5, 5, 5, 5, 4, 4, 4, 4, 4, 4]
    } else {
      // 四花色：标准模式，前4列每列6张，后6列每列5张
      cardsPerColumn = [6, 6, 6, 6, 5, 5, 5, 5, 5, 5]
    }

    // 发牌到桌面
    for (let col = 0; col < 10 && allCards.length > 0; col++) {
      const cardsInColumn = cardsPerColumn[col]
      for (let i = 0; i < cardsInColumn && allCards.length > 0; i++) {
        const card = allCards.pop()!
        // 最后一张正面朝上
        card.isFaceUp = i === cardsInColumn - 1
        gameState.tableau[col].push(card)
      }
    }

    // 剩余牌放入发牌堆
    gameState.stock = allCards

    // 开始计时
    startTimer()
  }

  /**
   * 开始计时器
   */
  function startTimer() {
    if (timer) clearInterval(timer)
    timer = window.setInterval(() => {
      if (!gameState.isGameOver && !gameState.isWon) {
        gameState.timeElapsed++
        // 每10秒扣1分
        if (gameState.timeElapsed % 10 === 0) {
          gameState.score = Math.max(0, gameState.score - 1)
        }
      }
    }, 1000)
  }

  /**
   * 停止计时器
   */
  function stopTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  /**
   * 保存移动历史
   */
  function saveHistory(move: MoveHistory) {
    // 如果当前不在历史末尾，删除后面的历史
    if (gameState.historyIndex < gameState.history.length - 1) {
      gameState.history = gameState.history.slice(0, gameState.historyIndex + 1)
    }

    gameState.history.push(move)
    gameState.historyIndex++

    // 限制历史记录数量
    if (gameState.history.length > MAX_HISTORY) {
      gameState.history.shift()
      gameState.historyIndex--
    }
  }

  /**
   * 发牌（同步版本，用于内部逻辑）
   */
  function dealCardsSync() {
    // 如果没有牌，就不发牌
    if (gameState.stock.length === 0) return false

    const columnsToDeal = Math.min(10, gameState.stock.length)

    // 向每列发一张牌
    for (let col = 0; col < columnsToDeal; col++) {
      if (gameState.stock.length === 0) break
      const card = gameState.stock.pop()!
      card.isFaceUp = true
      gameState.tableau[col].push(card)
    }

    gameState.moves++
    checkAutoComplete()
    return true
  }

  /**
   * 发牌（异步版本，支持动画）
   */
  function dealCards(onDeal?: (col: number) => void): Promise<boolean> {
    // 如果没有足够的牌，就不发牌
    if (gameState.stock.length === 0) return Promise.resolve(false)

    return new Promise((resolve) => {
      const cardsToDeal: Array<{ col: number; card: CardType }> = []
      const columnsToDeal = Math.min(10, gameState.stock.length)

      // 准备要发的牌
      for (let col = 0; col < columnsToDeal; col++) {
        if (gameState.stock.length === 0) break
        const card = gameState.stock.pop()!
        card.isFaceUp = true
        cardsToDeal.push({ col, card })
      }

      if (cardsToDeal.length === 0) {
        resolve(false)
        return
      }

      // 逐张发牌，每张间隔50ms
      cardsToDeal.forEach((item, index) => {
        setTimeout(() => {
          gameState.tableau[item.col].push(item.card)
          if (onDeal) {
            onDeal(item.col)
          }

          // 最后一张发完后完成
          if (index === cardsToDeal.length - 1) {
            gameState.moves++
            checkAutoComplete()
            resolve(true)
          }
        }, index * 50)
      })
    })
  }

  /**
   * 移动牌（从牌堆到牌堆）
   */
  function moveCards(
    fromCol: number,
    cardIndex: number,
    toCol: number
  ): boolean {
    if (fromCol === toCol) return false

    const fromPile = gameState.tableau[fromCol]
    if (cardIndex < 0 || cardIndex >= fromPile.length) return false

    // 提取可移动的序列
    const cardsToMove = extractMovableSequence(fromPile, cardIndex)
    if (cardsToMove.length === 0) return false

    const toPile = gameState.tableau[toCol]

    // 检查是否可以放置
    if (!canPlaceOnTableau(cardsToMove, toPile, gameState.difficulty)) {
      return false
    }

    // 保存历史
    saveHistory({
      from: 'tableau',
      to: 'tableau',
      fromIndex: fromCol,
      toIndex: toCol,
      cards: [...cardsToMove],
      timestamp: Date.now()
    })

    // 执行移动
    const cardsToMoveIds = new Set(cardsToMove.map((c: CardType) => c.id))
    gameState.tableau[fromCol] = fromPile.filter((c: CardType) => !cardsToMoveIds.has(c.id))
    gameState.tableau[toCol] = [...toPile, ...cardsToMove]

    // 翻开被移动后露出的牌
    if (gameState.tableau[fromCol].length > 0) {
      const topCard = gameState.tableau[fromCol][gameState.tableau[fromCol].length - 1]
      if (!topCard.isFaceUp) {
        topCard.isFaceUp = true
      }
    }

    gameState.moves++
    gameState.score += 5

    checkAutoComplete()
    checkWin()

    return true
  }

  /**
   * 移动到完成区
   */
  function moveToFoundation(col: number, cardIndex: number): boolean {
    const pile = gameState.tableau[col]
    if (cardIndex < 0 || cardIndex >= pile.length) return false

    // 提取完整的K到A序列（13张）
    const sequence = extractMovableSequence(pile, cardIndex)
    if (sequence.length !== 13) return false

    // 检查是否为完整的同花色序列（K到A）
    if (!canPlaceOnFoundation(sequence)) return false

    // 找到空的完成区位置
    const emptyFoundationIndex = gameState.foundation.findIndex((p: CardType[]) => p.length === 0)
    if (emptyFoundationIndex === -1) return false

    // 保存历史
    saveHistory({
      from: 'tableau',
      to: 'foundation',
      fromIndex: col,
      toIndex: emptyFoundationIndex,
      cards: [...sequence],
      timestamp: Date.now()
    })

    // 执行移动
    const sequenceIds = new Set(sequence.map((c: CardType) => c.id))
    gameState.tableau[col] = pile.filter((c: CardType) => !sequenceIds.has(c.id))
    gameState.foundation[emptyFoundationIndex] = sequence

    // 翻开被移动后露出的牌
    if (gameState.tableau[col].length > 0) {
      const topCard = gameState.tableau[col][gameState.tableau[col].length - 1]
      if (!topCard.isFaceUp) {
        topCard.isFaceUp = true
      }
    }

    gameState.moves++
    gameState.score += 100

    checkAutoComplete()
    checkWin()

    return true
  }

  /**
   * 检查自动完成
   */
  function checkAutoComplete() {
    // 检查所有列是否有完整的K到A序列
    for (let col = 0; col < 10; col++) {
      const pile = gameState.tableau[col]
      for (let i = 0; i <= pile.length - 13; i++) {
        if (moveToFoundation(col, i)) {
          // 递归检查，可能有多组序列
          checkAutoComplete()
          return
        }
      }
    }
  }

  /**
   * 检查游戏胜利
   */
  function checkWin() {
    // 检查8个完成区是否都有完整的序列
    const allComplete = gameState.foundation.every((pile: CardType[]) => pile.length === 13)
    if (allComplete) {
      gameState.isWon = true
      gameState.isGameOver = true
      stopTimer()
      // 胜利加分
      gameState.score += Math.floor((500 - gameState.timeElapsed) * 10)
    }
  }

  /**
   * 撤销
   */
  function undo() {
    if (gameState.historyIndex < 0) return false

    const move = gameState.history[gameState.historyIndex]

    // 撤销移动
    if (move.from === 'tableau' && move.to === 'tableau') {
      const toPile = gameState.tableau[move.toIndex]
      const fromPile = gameState.tableau[move.fromIndex]

      // 从目标列移除移动的牌
      const cardIds = new Set(move.cards.map((c: CardType) => c.id))
      gameState.tableau[move.toIndex] = toPile.filter((c: CardType) => !cardIds.has(c.id))

      // 将牌移回源列
      gameState.tableau[move.fromIndex] = [...fromPile, ...move.cards]

      // 恢复源列顶部牌的翻开状态：如果移回的牌后面还有牌（这些牌是移动后翻开的），需要将它们翻回背面
      // 但实际上，由于移动后自动翻开的特性，我们保持当前状态即可
      // 注意：move.cards中的牌保持移动时的状态（都是翻开的）
    } else if (move.from === 'tableau' && move.to === 'foundation') {
      // 从完成区移回
      gameState.foundation[move.toIndex] = []
      // 将牌移回源列
      gameState.tableau[move.fromIndex] = [...gameState.tableau[move.fromIndex], ...move.cards]
    }

    gameState.historyIndex--
    gameState.moves--
    gameState.score = Math.max(0, gameState.score - 5)

    return true
  }

  /**
   * 获取可移动的提示
   */
  function getHints(): Array<{ from: number; cardIndex: number; to: number }> {
    const hints: Array<{ from: number; cardIndex: number; to: number }> = []

    // 检查所有可能的移动
    for (let fromCol = 0; fromCol < 10; fromCol++) {
      const fromPile = gameState.tableau[fromCol]
      for (let cardIndex = 0; cardIndex < fromPile.length; cardIndex++) {
        if (!fromPile[cardIndex].isFaceUp) continue

        const sequence = extractMovableSequence(fromPile, cardIndex)
        if (sequence.length === 0) continue

        // 检查是否可以移动到其他列
        for (let toCol = 0; toCol < 10; toCol++) {
          if (fromCol === toCol) continue
          const toPile = gameState.tableau[toCol]
          if (canPlaceOnTableau(sequence, toPile, gameState.difficulty)) {
            hints.push({ from: fromCol, cardIndex, to: toCol })
          }
        }
      }
    }

    return hints
  }

  return {
    gameState,
    initGame,
    dealCards,
    dealCardsSync,
    moveCards,
    moveToFoundation,
    undo,
    getHints,
    startTimer,
    stopTimer
  }
}

