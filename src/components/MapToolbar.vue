<template>
  <!--
    地图工具栏（按钮/图标）
    使用 CSS3 过渡、悬停效果
    与地图联动：激活工具时通知 store
  -->
  <div class="map-toolbar">
    <button
      v-for="tool in tools"
      :key="tool.id"
      class="tool-btn"
      :class="{ active: store.activeTool === tool.id }"
      :title="tool.title"
      @click="store.setActiveTool(tool.id)"
    >
      <span class="tool-icon">{{ tool.icon }}</span>
      <span class="tool-label">{{ tool.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { useMapStore } from '@/stores/mapStore.js'

const store = useMapStore()

const tools = [
  { id: 'pan', icon: '✋', label: '漫游', title: '平移地图' },
  { id: 'zoom-in', icon: '🔍', label: '放大', title: '放大地图' },
  { id: 'zoom-out', icon: '🔎', label: '缩小', title: '缩小地图' },
  { id: 'measure', icon: '📏', label: '测量', title: '距离/面积测量' },
  { id: 'identify', icon: 'ℹ️', label: '识别', title: '要素识别' }
]
</script>

<style scoped>
.map-toolbar {
  position: absolute;
  top: 60px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--toolbar-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 6px;
  box-shadow: var(--shadow);
  z-index: 10;
}

/* 工具栏按钮：CSS3 过渡与悬停效果 */
.tool-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 8px 10px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 13px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

/* CSS3 悬停效果 */
.tool-btn:hover {
  background: var(--hover-bg);
  border-color: var(--accent-color);
  transform: translateX(-2px);
}

/* 激活状态 */
.tool-btn.active {
  background: var(--accent-color);
  color: #fff;
  border-color: var(--accent-color);
}

.tool-btn.active:hover {
  background: var(--accent-hover);
}

.tool-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.tool-btn:hover .tool-icon {
  transform: scale(1.2);
}

/* 响应式：移动端缩小工具栏 */
@media (max-width: 768px) {
  .tool-btn .tool-label {
    display: none;
  }
  .tool-btn {
    padding: 8px;
  }
}
</style>