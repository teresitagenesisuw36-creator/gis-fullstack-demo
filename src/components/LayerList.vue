<template>
  <!--
    图层列表组件（v-for + v-model 显隐控制）
    使用 Props/Emit 父子通信，computed 统计可见图层数
  -->
  <div class="layer-list">
    <div v-if="filteredLayers.length === 0" class="empty-tip">
      暂无图层
    </div>

    <div
      v-for="layer in filteredLayers"
      :key="layer.id"
      class="layer-item"
      :class="{ 'layer-hidden': !layer.visible }"
    >
      <!-- 可见性切换 -->
      <label class="layer-toggle">
        <input
          type="checkbox"
          :checked="layer.visible"
          @change="$emit('toggle-layer', layer.id)"
        />
        <span class="color-dot" :style="{ background: layer.color }"></span>
      </label>

      <!-- 图层信息 -->
      <div class="layer-info">
        <span class="layer-name">{{ layer.name }}</span>
        <span class="layer-type">{{ layer.type }}</span>
      </div>

      <!-- 透明度控制 -->
      <div class="layer-opacity" v-if="layer.visible">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          :value="layer.opacity"
          @input="$emit('set-opacity', layer.id, +$event.target.value)"
          title="透明度"
        />
      </div>

      <!-- 删除按钮 -->
      <button class="layer-remove" @click="$emit('remove-layer', layer.id)" title="删除图层">
        &times;
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLayers } from '@/composables/useLayers.js'

const props = defineProps({
  filterKeyword: {
    type: String,
    default: ''
  }
})

// Emit: 向父组件发送事件
defineEmits(['toggle-layer', 'set-opacity', 'remove-layer'])

const { layers, searchLayers } = useLayers()

// computed 过滤图层
const filteredLayers = computed(() =>
  searchLayers(props.filterKeyword)
)
</script>

<style scoped>
.layer-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-tip {
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  padding: 16px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px;
  border-radius: 6px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.layer-item:hover {
  border-color: var(--accent-color);
  background: var(--hover-bg);
}

.layer-item.layer-hidden {
  opacity: 0.55;
}

.layer-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.layer-toggle input[type="checkbox"] {
  display: none;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.layer-toggle input:checked + .color-dot {
  border-color: var(--accent-color);
  box-shadow: 0 0 4px var(--accent-color);
}

.layer-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.layer-name {
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-type {
  font-size: 10px;
  color: var(--text-secondary);
}

.layer-opacity {
  flex-shrink: 0;
}

.layer-opacity input[type="range"] {
  width: 40px;
  height: 4px;
  accent-color: var(--accent-color);
  cursor: pointer;
}

/* 删除按钮 */
.layer-remove {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.layer-remove:hover {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}
</style>