import type { Card, Suit, CardColor } from '../types'

/**
 * 获取牌的颜色
 */
export function getCardColor(suit: Suit): CardColor {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'
}

/**
 * 创建一张牌
 */
export function createCard(suit: Suit, rank: number, isFaceUp: boolean = false): Card {
  return {
    id: `${suit}-${rank}-${Math.random().toString(36).substr(2, 9)}`,
    suit,
    rank,
    isFaceUp,
    color: getCardColor(suit)
  }
}

/**
 * 创建标准52张牌组
 */
export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
  const deck: Card[] = []

  for (const suit of suits) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push(createCard(suit, rank, false))
    }
  }

  return deck
}

/**
 * 洗牌算法（Fisher-Yates）
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 获取牌的显示文本
 */
export function getCardRankText(rank: number): string {
  switch (rank) {
    case 1:
      return 'A'
    case 11:
      return 'J'
    case 12:
      return 'Q'
    case 13:
      return 'K'
    default:
      return rank.toString()
  }
}

/**
 * 获取花色的符号
 */
export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'hearts':
      return '♥'
    case 'diamonds':
      return '♦'
    case 'clubs':
      return '♣'
    case 'spades':
      return '♠'
  }
}

/**
 * 检查是否可以移动（同花色降序序列）
 */
export function isValidSequence(cards: Card[]): boolean {
  if (cards.length === 0) return false
  if (cards.length === 1) return true

  // 检查是否为同花色降序序列
  for (let i = 0; i < cards.length - 1; i++) {
    const current = cards[i]
    const next = cards[i + 1]

    // 必须是同花色
    if (current.suit !== next.suit) return false
    // 必须是降序（当前牌的点数 - 1 = 下一张牌的点数）
    if (current.rank - 1 !== next.rank) return false
  }

  return true
}

/**
 * 检查是否可以放置到目标位置
 */
export function canPlaceOnTableau(
  cards: Card[],
  targetPile: Card[],
  difficulty: 'one-suit' | 'two-suit' | 'four-suit'
): boolean {
  if (cards.length === 0) return false

  const topCard = cards[0]

  // 空列只能放置K或K开始的序列
  if (targetPile.length === 0) {
    return topCard.rank === 13
  }

  const bottomCard = targetPile[targetPile.length - 1]

  // 必须是正面朝上的牌
  if (!bottomCard.isFaceUp) return false

  // 检查是否可以连接
  // 对于单花色模式：必须同花色
  // 对于双花色模式：同一颜色即可
  // 对于四花色模式：只要点数匹配即可
  if (difficulty === 'one-suit') {
    if (topCard.suit !== bottomCard.suit) return false
  } else if (difficulty === 'two-suit') {
    if (topCard.color === bottomCard.color) return false
  }
  // four-suit模式允许任意花色

  // 点数必须是降序（topCard的rank = bottomCard的rank - 1）
  return topCard.rank === bottomCard.rank - 1
}

/**
 * 检查是否可以移动到完成区
 */
export function canPlaceOnFoundation(cards: Card[]): boolean {
  if (cards.length !== 13) return false

  // 必须是同花色的完整序列（K到A）
  if (!isValidSequence(cards)) return false

  const topCard = cards[0]
  const bottomCard = cards[cards.length - 1]

  // 必须以K开始，以A结束
  if (topCard.rank !== 13 || bottomCard.rank !== 1) return false

  return true
}

/**
 * 提取可移动的序列（从指定索引开始）
 */
export function extractMovableSequence(pile: Card[], startIndex: number): Card[] {
  if (startIndex < 0 || startIndex >= pile.length) return []
  if (!pile[startIndex].isFaceUp) return []

  // 从startIndex开始，提取连续的同花色降序序列
  const sequence: Card[] = [pile[startIndex]]

  for (let i = startIndex + 1; i < pile.length; i++) {
    const prev = pile[i - 1]
    const current = pile[i]

    // 必须是正面朝上
    if (!current.isFaceUp) break

    // 必须是同花色降序
    if (current.suit === prev.suit && current.rank === prev.rank - 1) {
      sequence.push(current)
    } else {
      break
    }
  }

  return sequence
}

