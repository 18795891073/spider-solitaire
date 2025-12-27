import { ref, onUnmounted } from 'vue'
import type { Card } from '../types'

/**
 * 拖拽视觉效果组合式函数
 */
export function useDragEffect() {
  const dragGhost = ref<HTMLElement | null>(null)
  const dragPosition = ref({ x: 0, y: 0 })
  const isDragging = ref(false)
  const draggingCards = ref<Card[]>([])
  const dragOffset = ref({ x: 0, y: 0 })

  /**
   * 开始拖拽
   */
  function startDrag(
    cards: Card[],
    event: MouseEvent,
    cardElement: HTMLElement
  ) {
    if (cards.length === 0) return

    isDragging.value = true
    draggingCards.value = cards

    const rect = cardElement.getBoundingClientRect()

    // 计算偏移量（鼠标相对于卡片的位置）
    dragOffset.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }

    dragPosition.value = {
      x: event.clientX - dragOffset.value.x,
      y: event.clientY - dragOffset.value.y
    }

    // 创建拖拽预览元素
    createDragGhost(cardElement, cards.length)

    // 添加鼠标移动和释放事件监听
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'

    event.preventDefault()
    event.stopPropagation()
  }

  /**
   * 创建拖拽预览
   */
  function createDragGhost(cardElement: HTMLElement, cardCount: number) {
    // 移除旧的预览
    if (dragGhost.value) {
      document.body.removeChild(dragGhost.value)
    }

    const ghost = cardElement.cloneNode(true) as HTMLElement

    // 设置样式
    ghost.style.position = 'fixed'
    ghost.style.pointerEvents = 'none'
    ghost.style.zIndex = '10000'
    ghost.style.opacity = '0.9'
    ghost.style.transform = 'scale(1.05) rotate(2deg)'
    ghost.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)'
    ghost.style.transition = 'none'
    ghost.style.left = `${dragPosition.value.x}px`
    ghost.style.top = `${dragPosition.value.y}px`
    ghost.style.cursor = 'grabbing'

    // 如果有多张牌，添加计数显示
    if (cardCount > 1) {
      const badge = document.createElement('div')
      badge.textContent = `${cardCount}`
      badge.style.position = 'absolute'
      badge.style.top = '-8px'
      badge.style.right = '-8px'
      badge.style.width = '24px'
      badge.style.height = '24px'
      badge.style.background = '#4caf50'
      badge.style.color = 'white'
      badge.style.borderRadius = '50%'
      badge.style.display = 'flex'
      badge.style.alignItems = 'center'
      badge.style.justifyContent = 'center'
      badge.style.fontSize = '12px'
      badge.style.fontWeight = 'bold'
      badge.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)'
      ghost.appendChild(badge)
    }

    document.body.appendChild(ghost)
    dragGhost.value = ghost
  }

  /**
   * 处理鼠标移动
   */
  function handleMouseMove(event: MouseEvent) {
    if (!isDragging.value || !dragGhost.value) return

    dragPosition.value = {
      x: event.clientX - dragOffset.value.x,
      y: event.clientY - dragOffset.value.y
    }

    // 更新预览位置
    dragGhost.value.style.left = `${dragPosition.value.x}px`
    dragGhost.value.style.top = `${dragPosition.value.y}px`
  }

  /**
   * 处理鼠标释放
   */
  function handleMouseUp() {
    cleanup()
  }

  /**
   * 清理拖拽状态
   */
  function cleanup() {
    isDragging.value = false

    if (dragGhost.value) {
      // 添加淡出动画
      dragGhost.value.style.transition = 'opacity 0.2s'
      dragGhost.value.style.opacity = '0'

      setTimeout(() => {
        if (dragGhost.value && dragGhost.value.parentNode) {
          document.body.removeChild(dragGhost.value)
        }
        dragGhost.value = null
      }, 200)
    }

    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    draggingCards.value = []
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    isDragging,
    dragPosition,
    draggingCards,
    startDrag,
    cleanup
  }
}

