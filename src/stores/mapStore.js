import { defineStore } from 'pinia'
import { LayerModel } from '@/models/LayerModel.js'

/**
 * 全局地图与图层状态管理（Pinia）
 * - 管理地图中心、缩放级别
 * - 管理图层列表与可见性
 * - 管理主题模式
 * - 鼠标坐标实时显示
 */
export const useMapStore = defineStore('map', {
  state: () => ({
    // 地图状态
    center: [116.4074, 39.9042], // 默认北京
    zoom: 10,
    // 鼠标实时坐标
    mouseCoord: [0, 0],
    // 主题：light / dark
    theme: 'light',
    // 底图类型：street / satellite / hybrid
    activeBasemap: 'street',
    // 图层列表（存储为普通对象，便于持久化）
    layers: [
      new LayerModel({ id: 'layer-1', name: '兴趣点 (POI)', type: 'Point', color: '#e74c3c' }).toJSON(),
      new LayerModel({ id: 'layer-2', name: '道路网络', type: 'LineString', color: '#3498db' }).toJSON(),
      new LayerModel({ id: 'layer-3', name: '行政区划', type: 'Polygon', color: '#2ecc71', visible: true }).toJSON()
    ],
    // 工具栏激活状态
    activeTool: null // 'pan' | 'zoom-in' | 'zoom-out' | 'measure' | 'identify'
  }),

  getters: {
    /** 可见图层列表 */
    visibleLayers: (state) => state.layers.filter((l) => l.visible),

    /** 可见图层数量 */
    visibleLayerCount: (state) => state.layers.filter((l) => l.visible).length,

    /** 当前主题是否为深色 */
    isDark: (state) => state.theme === 'dark',

    /** 按类型分组图层 */
    layersByType: (state) =>
      state.layers.reduce((acc, l) => {
        acc[l.type] = [...(acc[l.type] || []), l]
        return acc
      }, {}),

    /** 格式化后的鼠标坐标 */
    formattedCoord: (state) => {
      const [lon, lat] = state.mouseCoord
      return `经度: ${lon.toFixed(6)}  纬度: ${lat.toFixed(6)}`
    }
  },

  actions: {
    /** 设置地图中心 */
    setCenter(coord) {
      this.center = coord
    },

    /** 设置缩放级别 */
    setZoom(zoom) {
      this.zoom = Math.max(1, Math.min(20, zoom))
    },

    /** 更新鼠标坐标 */
    setMouseCoord(coord) {
      this.mouseCoord = coord
    },

    /** 切换主题 */
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', this.theme)
    },

    /** 初始化主题 */
    initTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
    },

    /** 切换图层可见性 */
    toggleLayerVisibility(layerId) {
      const layer = this.layers.find((l) => l.id === layerId)
      if (layer) {
        layer.visible = !layer.visible
      }
    },

    /** 设置图层透明度 */
    setLayerOpacity(layerId, opacity) {
      const layer = this.layers.find((l) => l.id === layerId)
      if (layer) {
        layer.opacity = Math.max(0, Math.min(1, opacity))
      }
    },

    /** 添加图层 */
    addLayer(layerOptions) {
      const layer = new LayerModel(layerOptions)
      this.layers.push(layer.toJSON())
    },

    /** 移除图层 */
    removeLayer(layerId) {
      this.layers = this.layers.filter((l) => l.id !== layerId)
    },

    /** 激活工具栏工具 */
    setActiveTool(tool) {
      this.activeTool = this.activeTool === tool ? null : tool
    },

    /** 设置底图类型 */
    setActiveBasemap(basemap) {
      this.activeBasemap = basemap
    },

    /**
     * 恢复 LayerModel 实例并修正旧持久化数据
     * 修复之前版本中 layer-3 的 visible 可能被错误设为 false 的问题
     */
    hydrateLayers() {
      const defaults = {
        'layer-1': { visible: true },
        'layer-2': { visible: true },
        'layer-3': { visible: true }
      }
      this.layers = this.layers.map((json) => {
        const def = defaults[json.id]
        if (def && json.visible === false) {
          json.visible = true
        }
        return new LayerModel(json).toJSON()
      })
    },

    /** 初始化并修正持久化数据（应用启动时调用） */
    bootstrap() {
      this.hydrateLayers()
      this.initTheme()
    }
  },

  // Pinia 状态持久化配置（加分项）
  persist: {
    key: 'gis-map-store',
    storage: localStorage,
    paths: ['theme', 'layers', 'center', 'zoom'] // 仅持久化这些字段
  }
})