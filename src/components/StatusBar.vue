<template>
  <!-- 状态栏：语义化 footer 标签 -->
  <footer class="status-bar">
    <div class="status-left">
      <span class="status-item">坐标: {{ store.formattedCoord }}</span>
    </div>
    <div class="status-center">
      <span class="status-item">图层: {{ store.visibleLayerCount }}/{{ store.layers.length }} 可见</span>
    </div>
    <div class="status-right">
      <span class="status-item">工具: {{ toolLabel }}</span>
      <span class="status-divider">|</span>
      <span class="status-item">投影: WGS84</span>
      <span class="status-divider">|</span>
      <span class="status-item">比例尺: 1:{{ scale }}</span>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useMapStore } from '@/stores/mapStore.js'

const store = useMapStore()

const toolLabel = computed(() => {
  const map = { pan: '漫游', 'zoom-in': '放大', 'zoom-out': '缩小', measure: '测量', identify: '识别' }
  return map[store.activeTool] || '无'
})

// 模拟比例尺
const scale = computed(() => Math.round(500000 / Math.pow(2, store.zoom - 1)).toLocaleString())
</script>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  padding: 0 12px;
  background: var(--status-bg);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
  z-index: 90;
}

.status-item {
  white-space: nowrap;
}

.status-divider {
  margin: 0 6px;
  opacity: 0.4;
}

.status-left,
.status-center,
.status-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 移动端隐藏部分信息 */
@media (max-width: 768px) {
  .status-center {
    display: none;
  }
  .status-right .status-divider,
  .status-right .status-item:nth-child(3),
  .status-right .status-item:nth-child(5) {
    display: none;
  }
}
</style>