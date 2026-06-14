<template>
  <div class="map-container" ref="mapContainer">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span class="loading-text">加载地图中...</span>
    </div>

    <!-- Leaflet 地图容器 -->
    <div ref="leafletMap" class="leaflet-map"></div>

    <!-- 图层切换按钮 -->
    <div class="basemap-switcher">
      <button
        v-for="layer in basemaps"
        :key="layer.id"
        class="basemap-btn"
        :class="{ active: store.activeBasemap === layer.id }"
        @click="switchBasemap(layer.id)"
        :title="layer.name"
      >
        {{ layer.icon }}
      </button>
    </div>

    <!-- 地图工具栏 -->
    <MapToolbar />

    <!-- 坐标显示组件 -->
    <CoordinateDisplay :coord="store.mouseCoord" />

    <!-- 图层标注 -->
    <div class="layer-badge" v-if="visibleLayers.length > 0">
      <span
        v-for="l in visibleLayers"
        :key="l.id"
        class="badge"
        :style="{ background: l.color }"
      >
        {{ l.name }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useMapStore } from '@/stores/mapStore.js'
import CoordinateDisplay from './CoordinateDisplay.vue'
import MapToolbar from './MapToolbar.vue'

// 使用 CDN 全局变量
const L = window.L

const store = useMapStore()
const mapContainer = ref(null)
const leafletMap = ref(null)
const isLoading = ref(true)
let mapInstance = null
let baseLayers = {}
// 图层要素集合，用于可见性控制
let layerGroups = {}

const visibleLayers = computed(() => store.visibleLayers)

// 底图配置
const basemaps = [
  { id: 'street', name: '街道地图', icon: '🗺️' },
  { id: 'satellite', name: '卫星地图', icon: '🛰️' },
  { id: 'hybrid', name: '混合地图', icon: '🔄' }
]

/**
 * 将 [经度, 纬度] 转为 [纬度, 经度]（Leaflet 格式）
 */
const toLatLng = (lngLat) => [lngLat[1], lngLat[0]]

// 初始化地图
const initMap = async () => {
  if (!leafletMap.value) return

  await nextTick()

  // 配置 Leaflet 默认图标路径
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e74c3c"%3E%3Cpath d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/%3E%3C/svg%3E',
    iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e74c3c"%3E%3Cpath d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/%3E%3C/svg%3E',
    shadowUrl: ''
  })

  // 创建地图实例（注意：Leaflet 使用 [lat, lng]）
  mapInstance = L.map(leafletMap.value, {
    center: toLatLng(store.center),
    zoom: store.zoom,
    zoomControl: false
  })

  // 定义底图图层（ArcGIS - 已验证可访问）
  const arcgisTile = 'https://server.arcgisonline.com/ArcGIS/rest/services/{service}/MapServer/tile/{z}/{y}/{x}'

  const arcgisStreet = L.tileLayer(arcgisTile.replace('{service}', 'World_Street_Map'), {
    attribution: '© Esri | ArcGIS',
    maxZoom: 19
  })

  const arcgisSatellite = L.tileLayer(arcgisTile.replace('{service}', 'World_Imagery'), {
    attribution: '© Esri | ArcGIS',
    maxZoom: 19
  })

  // 混合底图：卫星图 + 地名标注叠层
  const arcgisLabel = L.tileLayer(arcgisTile.replace('{service}', 'Reference/World_Transportation'), {
    attribution: '© Esri | ArcGIS',
    maxZoom: 19,
    opacity: 0.6
  })

  baseLayers = {
    street: arcgisStreet,
    satellite: arcgisSatellite,
    hybrid: L.layerGroup([arcgisSatellite, arcgisLabel])
  }

  // 添加默认底图
  const activeBasemap = store.activeBasemap || 'street'
  baseLayers[activeBasemap].addTo(mapInstance)

  // 添加缩放控件
  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance)

  // 监听地图事件
  mapInstance.on('move', updateCenter)
  mapInstance.on('zoomend', updateZoom)
  mapInstance.on('mousemove', updateMouseCoord)

  // 渲染各图层要素（POI点、道路线、行政区划面）
  renderLayerFeatures()

  // 设置加载完成
  isLoading.value = false
}

// 更新地图中心（store 仍存 [lng, lat]）
const updateCenter = () => {
  if (mapInstance) {
    const center = mapInstance.getCenter()
    store.setCenter([center.lng, center.lat])
  }
}

const updateZoom = () => {
  if (mapInstance) {
    store.setZoom(mapInstance.getZoom())
  }
}

const updateMouseCoord = (e) => {
  if (e.latlng) {
    store.setMouseCoord([e.latlng.lng, e.latlng.lat])
  }
}

// 切换底图
const switchBasemap = (basemapId) => {
  if (!mapInstance || !baseLayers[basemapId]) return
  Object.keys(baseLayers).forEach(key => {
    mapInstance.removeLayer(baseLayers[key])
  })
  baseLayers[basemapId].addTo(mapInstance)
  store.setActiveBasemap(basemapId)
}

/**
 * 渲染所有图层的空间要素
 * layer-1: 兴趣点 (POI) - Point
 * layer-2: 道路网络 - LineString
 * layer-3: 行政区划 - Polygon
 */
const renderLayerFeatures = () => {
  if (!mapInstance) return

  // ==================== 图层1: 兴趣点 (POI) ====================
  const poiGroup = L.layerGroup()

  // 不同类别图标的HTML生成函数
  const poiIcons = {
    scenic: (color) => `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;">★</div>`,
    edu: (color) => `<div style="background:${color};width:16px;height:16px;border-radius:4px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;">📖</div>`,
    shop: (color) => `<div style="background:${color};width:16px;height:16px;border-radius:3px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:8px;color:#fff;">$</div>`,
    transport: (color) => `<div style="background:${color};width:16px;height:16px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:7px;color:#fff;">🚄</div></div>`,
    park: (color) => `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;">🌳</div>`
  }

  // 创建图标的辅助函数
  const createIcon = (html) => L.divIcon({
    className: 'custom-marker',
    html,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })

  // 丰富POI数据
  const poiData = [
    // 景点
    { coord: [39.9042, 116.4074], name: '北京天安门', category: '景点', desc: '国家象征，世界最大城市广场', icon: poiIcons.scenic('#e74c3c') },
    { coord: [39.9087, 116.3975], name: '故宫博物院', category: '景点', desc: '明清皇宫，世界文化遗产', icon: poiIcons.scenic('#e74c3c') },
    { coord: [39.9997, 116.2756], name: '颐和园', category: '景点', desc: '皇家园林，世界文化遗产', icon: poiIcons.scenic('#e74c3c') },
    { coord: [39.9160, 116.3900], name: '景山公园', category: '景点', desc: '俯瞰故宫全景的最佳地点', icon: poiIcons.scenic('#c0392b') },
    { coord: [39.9230, 116.3830], name: '北海公园', category: '景点', desc: '中国现存最古老皇家园林之一', icon: poiIcons.scenic('#c0392b') },
    { coord: [39.9350, 116.4110], name: '雍和宫', category: '景点', desc: '北京最大藏传佛教寺院', icon: poiIcons.scenic('#c0392b') },
    { coord: [39.8670, 116.4090], name: '天坛公园', category: '景点', desc: '明清皇帝祭天场所', icon: poiIcons.scenic('#c0392b') },
    // 教育
    { coord: [40.0028, 116.3261], name: '清华大学', category: '教育', desc: '百年名校，中国顶尖学府', icon: poiIcons.edu('#3498db') },
    { coord: [39.9923, 116.3103], name: '北京大学', category: '教育', desc: '中国最高学府之一，未名湖畔', icon: poiIcons.edu('#3498db') },
    { coord: [39.9560, 116.3260], name: '北京航空航天大学', category: '教育', desc: '航空航天领域顶尖高校', icon: poiIcons.edu('#2980b9') },
    { coord: [39.9700, 116.3000], name: '中国人民大学', category: '教育', desc: '中国人文社会科学最高学府', icon: poiIcons.edu('#2980b9') },
    { coord: [39.9480, 116.3600], name: '北京师范大学', category: '教育', desc: '中国师范类大学排头兵', icon: poiIcons.edu('#2980b9') },
    // 商业
    { coord: [39.9375, 116.4311], name: '国贸CBD', category: '商业', desc: '北京中央商务区核心区域', icon: poiIcons.shop('#f39c12') },
    { coord: [39.9450, 116.3521], name: '西单商业区', category: '商业', desc: '北京传统商业中心之一', icon: poiIcons.shop('#f39c12') },
    { coord: [39.9650, 116.3480], name: '中关村', category: '商业', desc: '中国硅谷，科技创业中心', icon: poiIcons.shop('#e67e22') },
    { coord: [39.9100, 116.4600], name: '三里屯太古里', category: '商业', desc: '潮流时尚聚集地', icon: poiIcons.shop('#e67e22') },
    { coord: [39.9130, 116.4160], name: '王府井步行街', category: '商业', desc: '百年商业老街', icon: poiIcons.shop('#e67e22') },
    // 交通枢纽
    { coord: [39.9050, 116.4340], name: '北京站', category: '交通枢纽', desc: '全国铁路特等站', icon: poiIcons.transport('#8e44ad') },
    { coord: [39.8980, 116.3800], name: '北京西站', category: '交通枢纽', desc: '亚洲最大铁路枢纽之一', icon: poiIcons.transport('#8e44ad') },
    { coord: [39.8620, 116.4280], name: '北京南站', category: '交通枢纽', desc: '京津城际及京沪高铁始发站', icon: poiIcons.transport('#8e44ad') },
    { coord: [40.0800, 116.5850], name: '首都国际机场', category: '交通枢纽', desc: '世界超大型机场', icon: poiIcons.transport('#8e44ad') },
    // 公园
    { coord: [39.9900, 116.2910], name: '奥林匹克森林公园', category: '公园', desc: '北京最大城市森林公园', icon: poiIcons.park('#27ae60') },
    { coord: [39.9400, 116.4390], name: '朝阳公园', category: '公园', desc: '北京四环内最大公园', icon: poiIcons.park('#27ae60') },
    { coord: [39.8700, 116.3530], name: '陶然亭公园', category: '公园', desc: '古典园林与现代公园结合', icon: poiIcons.park('#2ecc71') }
  ]

  poiData.forEach(p => {
    L.marker(p.coord, { icon: createIcon(p.icon) })
      .bindPopup(`
        <div style="min-width:160px;">
          <h3 style="margin:0 0 4px;color:#2c3e50;font-size:14px;">${p.name}</h3>
          <div style="font-size:11px;color:#7f8c8d;margin-bottom:4px;">
            <span style="background:${p.category === '景点' ? '#e74c3c' : p.category === '教育' ? '#3498db' : p.category === '商业' ? '#f39c12' : p.category === '交通枢纽' ? '#8e44ad' : '#27ae60'};color:#fff;padding:1px 6px;border-radius:3px;">${p.category}</span>
          </div>
          <p style="margin:4px 0;font-size:12px;color:#555;">${p.desc}</p>
          <p style="margin:2px 0 0;font-size:10px;color:#999;">经度 ${p.coord[1].toFixed(4)} | 纬度 ${p.coord[0].toFixed(4)}</p>
        </div>
      `)
      .addTo(poiGroup)
  })
  poiGroup.addTo(mapInstance)
  layerGroups['layer-1'] = poiGroup

  // ==================== 图层2: 道路网络 ====================
  const roadGroup = L.layerGroup()

  // 不同等级道路样式
  const roadStyles = {
    expressway: { color: '#e74c3c', weight: 4, opacity: 0.9 },     // 高速路-红色
    ring: { color: '#3498db', weight: 3.5, opacity: 0.85 },          // 环路-蓝色
    main: { color: '#f39c12', weight: 3, opacity: 0.8 },            // 主干道-橙色
    secondary: { color: '#7f8c8d', weight: 2, opacity: 0.7 }        // 次干道-灰色
  }

  const roads = [
    // ---- 高速公路 ----
    { coords: [[39.9500, 116.3500], [39.9650, 116.3700], [39.9850, 116.3950], [40.0100, 116.4100], [40.0400, 116.4300]], name: '机场高速', style: roadStyles.expressway },
    { coords: [[39.9050, 116.4340], [39.9200, 116.4500], [39.9450, 116.4600], [39.9700, 116.4700], [40.0000, 116.4750]], name: '京通快速', style: roadStyles.expressway },
    { coords: [[39.9400, 116.2800], [39.9500, 116.3000], [39.9600, 116.3300], [39.9700, 116.3600], [39.9750, 116.3900], [39.9800, 116.4200]], name: '京藏高速（G6）', style: roadStyles.expressway },
    { coords: [[39.9200, 116.2800], [39.9150, 116.3000], [39.9080, 116.3300], [39.9020, 116.3600], [39.8980, 116.3900], [39.8950, 116.4200]], name: '京港澳高速（G4）', style: roadStyles.expressway },

    // ---- 环线 ----
    { coords: [[39.9050, 116.3400], [39.9200, 116.3500], [39.9350, 116.3550], [39.9500, 116.3500], [39.9550, 116.3700], [39.9500, 116.3900], [39.9350, 116.4000], [39.9200, 116.4100], [39.9050, 116.4150], [39.8950, 116.4000], [39.8900, 116.3700], [39.8950, 116.3450], [39.9050, 116.3400]], name: '二环路', style: roadStyles.ring },
    { coords: [[39.8850, 116.3100], [39.9000, 116.3000], [39.9200, 116.3050], [39.9450, 116.3150], [39.9650, 116.3300], [39.9700, 116.3600], [39.9650, 116.3900], [39.9500, 116.4200], [39.9300, 116.4350], [39.9100, 116.4400], [39.8900, 116.4300], [39.8800, 116.4000], [39.8780, 116.3600], [39.8800, 116.3300], [39.8850, 116.3100]], name: '三环路', style: roadStyles.ring },
    { coords: [[39.8700, 116.2800], [39.8950, 116.2700], [39.9250, 116.2750], [39.9550, 116.2900], [39.9800, 116.3150], [39.9900, 116.3500], [39.9850, 116.3850], [39.9700, 116.4200], [39.9450, 116.4450], [39.9150, 116.4550], [39.8900, 116.4500], [39.8700, 116.4300], [39.8600, 116.3950], [39.8580, 116.3500], [39.8620, 116.3100], [39.8700, 116.2800]], name: '四环路', style: roadStyles.ring },
    { coords: [[39.8400, 116.2600], [39.8700, 116.2450], [39.9050, 116.2480], [39.9400, 116.2600], [39.9700, 116.2800], [40.0000, 116.3100], [40.0100, 116.3450], [40.0050, 116.3800], [39.9900, 116.4200], [39.9600, 116.4500], [39.9300, 116.4650], [39.8950, 116.4700], [39.8650, 116.4600], [39.8450, 116.4400], [39.8350, 116.4000], [39.8330, 116.3450], [39.8350, 116.2950], [39.8400, 116.2600]], name: '五环路', style: roadStyles.ring },

    // ---- 主干道 ----
    { coords: [[39.9050, 116.3000], [39.9055, 116.3300], [39.9058, 116.3600], [39.9055, 116.3900], [39.9050, 116.4300]], name: '长安街', style: roadStyles.main },
    { coords: [[39.8800, 116.3975], [39.8950, 116.3975], [39.9050, 116.3975], [39.9200, 116.3975], [39.9400, 116.3975], [39.9600, 116.3975]], name: '中轴线（南段）', style: roadStyles.main },
    { coords: [[39.9050, 116.3400], [39.8850, 116.3200], [39.8700, 116.3100], [39.8550, 116.3050]], name: '西三环南路', style: roadStyles.secondary },

    // ---- 次干道 ----
    { coords: [[39.8950, 116.3450], [39.8900, 116.3600], [39.8880, 116.3750], [39.8900, 116.3900]], name: '广安门外大街', style: roadStyles.secondary },
    { coords: [[39.9300, 116.3550], [39.9350, 116.3700], [39.9400, 116.3850], [39.9450, 116.4000]], name: '朝阳门外大街', style: roadStyles.secondary },
    { coords: [[39.9200, 116.3500], [39.9150, 116.3650], [39.9100, 116.3800], [39.9080, 116.3950]], name: '东四大街', style: roadStyles.secondary },
    { coords: [[39.9500, 116.3500], [39.9400, 116.3500], [39.9300, 116.3500], [39.9200, 116.3500], [39.9100, 116.3500]], name: '新街口外大街', style: roadStyles.secondary }
  ]

  // 为每条道路添加名称标注
  roads.forEach(road => {
    // 绘制道路线
    const polyline = L.polyline(road.coords, {
      color: road.style.color,
      weight: road.style.weight,
      opacity: road.style.opacity
    }).bindPopup(`
      <div style="min-width:120px;">
        <strong style="color:${road.style.color};">${road.name}</strong>
        <br/><span style="font-size:11px;color:#999;">等级: ${Object.keys(roadStyles).find(k => roadStyles[k] === road.style)}</span>
        <br/><span style="font-size:11px;color:#999;">长度: 约 ${(road.coords.length - 1) * 1.5} km</span>
      </div>
    `)
    polyline.addTo(roadGroup)

    // 在道路中间位置添加文字标注
    const midIdx = Math.floor(road.coords.length / 2)
    const midPoint = road.coords[midIdx]
    L.marker(midPoint, {
      icon: L.divIcon({
        className: 'road-label',
        html: `<span style="background:${road.style.color};color:#fff;padding:1px 6px;border-radius:3px;font-size:10px;white-space:nowrap;opacity:0.8;">${road.name}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      }),
      interactive: false
    }).addTo(roadGroup)
  })
  roadGroup.addTo(mapInstance)
  layerGroups['layer-2'] = roadGroup

  // ==================== 图层3: 行政区划 (Polygon) ====================
  const polygonGroup = L.layerGroup()
  const districts = [
    {
      coords: [[39.8800, 116.3400], [39.9200, 116.3350], [39.9300, 116.3700], [39.9250, 116.4000], [39.9050, 116.4150], [39.8900, 116.4000], [39.8800, 116.3700], [39.8800, 116.3400]],
      name: '东城区',
      area: '41.84 km²',
      population: '约 87 万',
      density: '高',
      color: '#2ecc71'
    },
    {
      coords: [[39.8800, 116.3400], [39.8600, 116.3300], [39.8500, 116.3550], [39.8450, 116.3750], [39.8600, 116.3900], [39.8800, 116.4000], [39.8800, 116.3700], [39.8800, 116.3400]],
      name: '西城区',
      area: '50.70 km²',
      population: '约 113 万',
      density: '高',
      color: '#27ae60'
    },
    {
      coords: [[39.9300, 116.4000], [39.9700, 116.3950], [39.9750, 116.4300], [39.9500, 116.4450], [39.9250, 116.4350], [39.9250, 116.4000]],
      name: '朝阳区',
      area: '470.8 km²',
      population: '约 385 万',
      density: '中',
      color: '#1abc9c'
    },
    {
      coords: [[39.9300, 116.3350], [39.9550, 116.3150], [39.9750, 116.3350], [39.9800, 116.3650], [39.9700, 116.3950], [39.9300, 116.4000], [39.9250, 116.3700], [39.9300, 116.3350]],
      name: '海淀区',
      area: '431.0 km²',
      population: '约 369 万',
      density: '中',
      color: '#16a085'
    },
    {
      coords: [[39.8450, 116.3750], [39.8350, 116.3600], [39.8250, 116.3700], [39.8200, 116.3850], [39.8300, 116.4000], [39.8450, 116.4000], [39.8600, 116.3900], [39.8450, 116.3750]],
      name: '丰台区',
      area: '306.0 km²',
      population: '约 232 万',
      density: '中',
      color: '#8e44ad'
    },
    {
      coords: [[39.8150, 116.3500], [39.8100, 116.3350], [39.7950, 116.3400], [39.7900, 116.3600], [39.7950, 116.3800], [39.8100, 116.3850], [39.8200, 116.3750], [39.8150, 116.3500]],
      name: '房山区',
      area: '2019 km²',
      population: '约 131 万',
      density: '低',
      color: '#e74c3c'
    }
  ]

  districts.forEach(d => {
    L.polygon(d.coords, {
      color: d.color,
      fillColor: d.color,
      fillOpacity: 0.2,
      weight: 2.5
    }).bindPopup(`
      <div style="min-width:150px;">
        <h3 style="margin:0 0 6px;color:${d.color};font-size:15px;">${d.name}</h3>
        <table style="font-size:12px;border-collapse:collapse;width:100%;">
          <tr><td style="padding:2px 4px;color:#888;">面积</td><td style="padding:2px 4px;font-weight:500;">${d.area}</td></tr>
          <tr><td style="padding:2px 4px;color:#888;">人口</td><td style="padding:2px 4px;font-weight:500;">${d.population}</td></tr>
          <tr><td style="padding:2px 4px;color:#888;">人口密度</td><td style="padding:2px 4px;font-weight:500;">${d.density}</td></tr>
        </table>
      </div>
    `).addTo(polygonGroup)

    // 区域名称标注
    const centerLat = d.coords.reduce((s, c) => s + c[0], 0) / d.coords.length
    const centerLng = d.coords.reduce((s, c) => s + c[1], 0) / d.coords.length
    L.marker([centerLat, centerLng], {
      icon: L.divIcon({
        className: 'district-label',
        html: `<span style="color:${d.color};font-size:13px;font-weight:700;text-shadow:0 1px 2px rgba(0,0,0,0.3),0 0 4px #fff;background:rgba(255,255,255,0.7);padding:2px 8px;border-radius:4px;">${d.name}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      }),
      interactive: false
    }).addTo(polygonGroup)
  })
  polygonGroup.addTo(mapInstance)
  layerGroups['layer-3'] = polygonGroup

  // ==================== 添加地图比例尺 ====================
  L.control.scale({
    position: 'bottomleft',
    metric: true,
    imperial: false,
    maxWidth: 200
  }).addTo(mapInstance)

  // 根据 store 中的可见性同步显示/隐藏
  store.layers.forEach(l => {
    const group = layerGroups[l.id]
    if (group && !l.visible) {
      mapInstance.removeLayer(group)
    }
  })
}

// 监听图层可见性变化，同步地图上的要素显示
watch(() => store.layers.map(l => ({ id: l.id, visible: l.visible })), (newVal) => {
  if (!mapInstance) return
  newVal.forEach(({ id, visible }) => {
    const group = layerGroups[id]
    if (!group) return
    if (visible) {
      mapInstance.addLayer(group)
    } else {
      mapInstance.removeLayer(group)
    }
  })
}, { deep: true })

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.off('move', updateCenter)
    mapInstance.off('zoomend', updateZoom)
    mapInstance.off('mousemove', updateMouseCoord)
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<style scoped>
.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 400px;
}

.leaflet-map {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  pointer-events: none;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #606266;
}

.basemap-switcher {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1000;
  display: flex;
  gap: 4px;
  background: var(--toolbar-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 4px;
  box-shadow: var(--shadow);
}

.basemap-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.basemap-btn:hover {
  background: var(--hover-bg);
}

.basemap-btn.active {
  background: var(--accent-color);
}

.layer-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1000;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: #fff;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
</style>