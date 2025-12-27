/**
 * 扑克牌花色
 */
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'

/**
 * 牌的颜色
 */
export type CardColor = 'red' | 'black'

/**
 * 游戏难度
 */
export type Difficulty = 'one-suit' | 'two-suit' | 'four-suit'

/**
 * 单张扑克牌
 */
export interface Card {
  /** 唯一标识符 */
  id: string
  /** 花色 */
  suit: Suit
  /** 点数 (1-13: A=1, J=11, Q=12, K=13) */
  rank: number
  /** 是否正面朝上 */
  isFaceUp: boolean
  /** 颜色 */
  color: CardColor
}

/**
 * 移动历史记录
 */
export interface MoveHistory {
  from: 'tableau' | 'foundation' | 'stock'
  to: 'tableau' | 'foundation'
  fromIndex: number
  toIndex: number
  cards: Card[]
  timestamp: number
}

/**
 * 游戏状态
 */
export interface GameState {
  /** 发牌堆 */
  stock: Card[]
  /** 10列游戏牌堆 */
  tableau: Card[][]
  /** 完成区 (8个位置) */
  foundation: Card[][]
  /** 分数 */
  score: number
  /** 经过的时间（秒） */
  timeElapsed: number
  /** 移动步数 */
  moves: number
  /** 游戏是否结束 */
  isGameOver: boolean
  /** 是否胜利 */
  isWon: boolean
  /** 难度设置 */
  difficulty: Difficulty
  /** 移动历史（用于撤销） */
  history: MoveHistory[]
  /** 历史索引（用于撤销/重做） */
  historyIndex: number
}

