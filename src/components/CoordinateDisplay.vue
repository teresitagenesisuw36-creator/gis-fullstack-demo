<template>
  <!--
    坐标显示组件（组合式 API）
    实时显示鼠标经纬度，从 mapStore 获取数据
  -->
  <div class="coord-display">
    <div class="coord-row">
      <span class="coord-label">经度</span>
      <span class="coord-value">{{ coord[0].toFixed(6) }}</span>
    </div>
    <div class="coord-row">
      <span class="coord-label">纬度</span>
      <span class="coord-value">{{ coord[1].toFixed(6) }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * Props: 接收父组件传入的坐标数据
 */
defineProps({
  coord: {
    type: Array, // [经度, 纬度]
    default: () => [0, 0]
  }
})
</script>

<style scoped>
.coord-display {
  position: absolute;
  bottom: 36px;
  left: 12px;
  background: var(--toolbar-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  box-shadow: var(--shadow);
  z-index: 10;
}

.coord-row {
  display: flex;
  gap: 6px;
  line-height: 1.6;
}

.coord-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.coord-value {
  color: var(--accent-color);
  font-family: 'Consolas', 'Courier New', monospace;
  font-weight: 600;
}
</style>