import { ref, onUnmounted } from 'vue'
import type { Card } from '../types'

/**
 * 拖拽功能组合式函数
 */
export function useDrag() {
  const draggingCard = ref<Card | null>(null)
  const dragStartPos = ref({ x: 0, y: 0 })
  const dragCurrentPos = ref({ x: 0, y: 0 })
  const isDragging = ref(false)
  const dragOffset = ref({ x: 0, y: 0 })

  let dragGhost: HTMLElement | null = null

  /**
   * 开始拖拽
   */
  function startDrag(card: Card, event: MouseEvent, cardElement: HTMLElement) {
    draggingCard.value = card
    isDragging.value = true

    const rect = cardElement.getBoundingClientRect()
    dragStartPos.value = { x: event.clientX, y: event.clientY }
    dragCurrentPos.value = { x: event.clientX, y: event.clientY }
    dragOffset.value = {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2
    }

    // 创建拖拽预览
    createDragGhost(cardElement, event)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    event.preventDefault()
  }

  /**
   * 创建拖拽预览
   */
  function createDragGhost(cardElement: HTMLElement, event: MouseEvent) {
    dragGhost = cardElement.cloneNode(true) as HTMLElement
    dragGhost.style.position = 'fixed'
    dragGhost.style.pointerEvents = 'none'
    dragGhost.style.zIndex = '10000'
    dragGhost.style.opacity = '0.8'
    dragGhost.style.transform = 'scale(1.05)'
    dragGhost.style.left = `${event.clientX - dragOffset.value.x}px`
    dragGhost.style.top = `${event.clientY - dragOffset.value.y}px`
    document.body.appendChild(dragGhost)
  }

  /**
   * 处理鼠标移动
   */
  function handleMouseMove(event: MouseEvent) {
    if (!isDragging.value || !dragGhost) return

    dragCurrentPos.value = { x: event.clientX, y: event.clientY }
    dragGhost.style.left = `${event.clientX - dragOffset.value.x}px`
    dragGhost.style.top = `${event.clientY - dragOffset.value.y}px`
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
    draggingCard.value = null

    if (dragGhost) {
      document.body.removeChild(dragGhost)
      dragGhost = null
    }

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  /**
   * 获取拖拽目标位置
   */
  function getDropTarget(event: MouseEvent): HTMLElement | null {
    const element = document.elementFromPoint(event.clientX, event.clientY)
    if (!element) return null

    // 查找最近的tableau-pile或foundation-pile
    return element.closest('.tableau-pile, .foundation-pile') as HTMLElement | null
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    draggingCard,
    isDragging,
    dragCurrentPos,
    startDrag,
    cleanup,
    getDropTarget
  }
}

