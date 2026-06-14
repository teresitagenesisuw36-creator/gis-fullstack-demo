<template>
  <!-- 侧边栏：语义化 aside 标签 -->
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <h2 class="sidebar-title">图层控制</h2>
      <button class="collapse-btn" @click="collapsed = !collapsed" :title="collapsed ? '展开' : '收起'">
        {{ collapsed ? '▶' : '◀' }}
      </button>
    </div>

    <transition name="fade">
      <div v-show="!collapsed" class="sidebar-content">
        <!-- 可见图层统计（computed） -->
        <div class="layer-stats">
          可见图层: <strong>{{ visibleCount }}</strong> / {{ totalCount }}
        </div>

        <!-- 搜索过滤 -->
        <LayerSearch @search="onSearch" />

        <!-- 图层列表 -->
        <LayerList
          :filter-keyword="searchKeyword"
        />
      </div>
    </transition>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLayers } from '@/composables/useLayers.js'
import LayerList from './LayerList.vue'
import LayerSearch from './LayerSearch.vue'

const { layers, visibleLayerCount } = useLayers()

const collapsed = ref(false)
const searchKeyword = ref('')

const totalCount = computed(() => layers.value.length)
const visibleCount = visibleLayerCount

const onSearch = (keyword) => {
  searchKeyword.value = keyword
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 40px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.collapse-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.2s;
}

.collapse-btn:hover {
  background: var(--hover-bg);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.layer-stats {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 4px 8px;
  margin-bottom: 8px;
  background: var(--hover-bg);
  border-radius: 4px;
}

/* 响应式：移动端侧边栏 */
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    left: 0;
    top: 52px;
    bottom: 28px;
    z-index: 50;
    box-shadow: var(--shadow);
  }
  .sidebar.collapsed {
    width: 0;
  }
}
</style>