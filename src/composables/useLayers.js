import { computed } from 'vue'
import { useMapStore } from '@/stores/mapStore.js'

/**
 * 图层逻辑复用 Composables
 * 封装图层的通用操作和计算逻辑
 */
export function useLayers() {
  const mapStore = useMapStore()

  const layers = computed(() => mapStore.layers)
  const visibleLayers = computed(() => mapStore.visibleLayers)
  const visibleLayerCount = computed(() => mapStore.visibleLayerCount)
  const layersByType = computed(() => mapStore.layersByType)

  /**
   * 搜索过滤图层
   * @param {string} keyword - 搜索关键词
   * @returns {Array} 匹配的图层
   */
  const searchLayers = (keyword) => {
    const kw = keyword.toLowerCase().trim()
    if (!kw) return layers.value
    return layers.value.filter(
      (l) =>
        l.name.toLowerCase().includes(kw) || l.type.toLowerCase().includes(kw)
    )
  }

  /**
   * 切换图层可见性
   */
  const toggleLayer = (layerId) => {
    mapStore.toggleLayerVisibility(layerId)
  }

  /**
   * 设置图层透明度
   */
  const setOpacity = (layerId, opacity) => {
    mapStore.setLayerOpacity(layerId, opacity)
  }

  /**
   * 移除图层
   */
  const removeLayer = (layerId) => {
    mapStore.removeLayer(layerId)
  }

  /**
   * 添加图层
   */
  const addLayer = (options) => {
    mapStore.addLayer(options)
  }

  return {
    layers,
    visibleLayers,
    visibleLayerCount,
    layersByType,
    searchLayers,
    toggleLayer,
    setOpacity,
    removeLayer,
    addLayer
  }
}

/**
 * 主题逻辑复用
 */
export function useTheme() {
  const mapStore = useMapStore()

  const theme = computed(() => mapStore.theme)
  const isDark = computed(() => mapStore.isDark)

  const toggle = () => {
    mapStore.toggleTheme()
  }

  return { theme, isDark, toggle }
}