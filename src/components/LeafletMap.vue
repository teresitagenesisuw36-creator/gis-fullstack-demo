<template>
  <div class="leaflet-wrapper">
    <div ref="mapEl" class="map-el"></div>

    <!-- 加载 -->
    <div v-if="loading" class="map-loading">
      <div class="spinner"></div><span>加载地图中...</span>
    </div>

    <!-- 底图切换器 -->
    <div class="basemap-ctrl">
      <button v-for="b in basemaps" :key="b.id"
        :class="['bm-btn', { active: currentBasemap === b.id }]"
        @click="switchBasemap(b.id)" :title="b.label">
        {{ b.icon }}
      </button>
    </div>

    <!-- 地图书签 -->
    <div class="bookmark-ctrl">
      <button v-for="bm in bookmarks" :key="bm.id"
        class="bm-item" @click="flyTo(bm.latlng, bm.zoom)" :title="bm.name">
        {{ bm.icon }} {{ bm.name }}
      </button>
    </div>

    <!-- 距离测量面板 -->
    <div class="measure-ctrl">
      <button :class="['measure-btn', { active: measuring }]" @click="toggleMeasure">
        {{ measuring ? '停止测量' : '📏 测距' }}
      </button>
      <span v-if="measureResult" class="measure-result">{{ measureResult }}</span>
      <button v-if="measureResult" class="measure-clear" @click="clearMeasure">✕</button>
    </div>

    <!-- 专题图模式切换 -->
    <div class="thematic-ctrl">
      <select v-model="thematicMode" @change="applyThematic">
        <option value="">普通视图</option>
        <option value="choropleth">分级设色图 (人口密度)</option>
        <option value="proportional">比例符号图 (游客量)</option>
        <option value="bivariate">双变量地图 (密度+GDP)</option>
      </select>
    </div>

    <!-- 标注编辑器 -->
    <div class="editor-ctrl">
      <button :class="['edit-btn', { active: editing }]" @click="toggleEdit">
        {{ editing ? '✓ 完成编辑' : '✏️ 编辑标注' }}
      </button>
      <div v-if="editing" class="edit-panel">
        <input type="text" v-model="newMarkerName" placeholder="标注名称" />
        <select v-model="newMarkerCategory">
          <option value="景点">景点</option>
          <option value="教育">教育</option>
          <option value="商业">商业</option>
          <option value="体育">体育</option>
          <option value="文化">文化</option>
          <option value="交通">交通</option>
        </select>
        <button @click="cancelEdit">取消</button>
      </div>
    </div>

    <!-- 图例面板 -->
    <div v-if="legendItems.length" class="legend-panel">
      <h4>{{ legendTitle }}</h4>
      <div v-for="item in legendItems" :key="item.label" class="legend-row">
        <span class="legend-color" :style="{ background: item.color, width: item.size || '16px', height: item.size || '16px', borderRadius: item.shape === 'circle' ? '50%' : '2px' }"></span>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

// 使用 CDN 全局变量
const L = window.L

const emit = defineEmits(['loaded', 'coordUpdate'])

const mapEl = ref(null)
const loading = ref(true)
const currentBasemap = ref('street')
const thematicMode = ref('')
const measuring = ref(false)
const measureResult = ref('')
const legendItems = ref([])
const legendTitle = ref('')
const editing = ref(false)
const newMarkerName = ref('')
const newMarkerCategory = ref('景点')

let map = null
let basemapLayers = {}
let poiLayer = null
let districtLayer = null
let roadLayer = null
let measurePoints = []
let measureMarkers = []
let measureLine = null

// Popup / Tooltip 等辅助
const emitIf = (e) => { if (e?.latlng) emit('coordUpdate', [e.latlng.lng, e.latlng.lat]) }

onMounted(async () => {
  await nextTick()
  initMap()
})

const initMap = () => {
  if (!mapEl.value) return

  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e74c3c"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'),
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e74c3c"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'),
    shadowUrl: ''
  })

  map = L.map(mapEl.value, {
    center: [39.908, 116.397],
    zoom: 12,
    zoomControl: false
  })

  // 底图
  basemapLayers.street = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri | ArcGIS', maxZoom: 19 })
  basemapLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri | ArcGIS', maxZoom: 19 })
  basemapLayers.topo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri | ArcGIS', maxZoom: 19 })
  basemapLayers.hybrid = L.layerGroup([
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }),
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, opacity: 0.7 })
  ])

  basemapLayers[currentBasemap.value].addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map)

  map.on('mousemove', (e) => emitIf(e))
  map.on('click', onMapClick)

  loadGeoJSONData()
  loading.value = false
  emit('loaded')
}

// 加载 GeoJSON 数据
const loadGeoJSONData = async () => {
  // ---------- POI 数据（点）----------
  try {
    const poiRes = await fetch('/data/beijing_pois.geojson')
    const poiGeojson = await poiRes.json()

    const catColors = { 景点: '#e74c3c', 教育: '#3498db', 商业: '#f39c12', 体育: '#2ecc71', 文化: '#9b59b6', 交通: '#8e44ad' }

    const poiIcons = {}
    for (const [cat, col] of Object.entries(catColors)) {
      poiIcons[cat] = L.divIcon({
        className: 'custom-poi',
        html: `<div style="background:${col};width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -9]
      })
    }

    poiLayer = L.geoJSON(poiGeojson, {
      pointToLayer: (feature, latlng) => {
        const cat = feature.properties.category
        return L.marker(latlng, { icon: poiIcons[cat] || poiIcons['景点'] })
          .bindPopup(`<b>${feature.properties.name}</b><br/>类别: ${cat}<br/>年游客量: ${feature.properties.visitors.toLocaleString()}`)
          .bindTooltip(feature.properties.name, { direction: 'top', offset: [0, -12] })
    }})
    if (currentBasemap.value !== 'satellite') poiLayer.addTo(map)
  } catch (e) { console.warn('POI 加载失败:', e) }

  // ---------- 行政区 GeoJSON（用于分级设色/比例符号）----------
  try {
    const distRes = await fetch('/data/beijing_districts.geojson')
    const distGeojson = await distRes.json()

    districtLayer = L.geoJSON(distGeojson, {
      style: () => ({ color: '#999', weight: 1, fillOpacity: 0 }), // 默认透明，等待专题图切换
      onEachFeature: (feature, layer) => {
        const p = feature.properties
        layer.bindPopup(`<b>${p.name}</b><br/>人口: ${p.population.toLocaleString()}<br/>面积: ${p.area} km²<br/>密度: ${p.density} 人/km²<br/>GDP: ${p.gdp} 亿元`)
      }
    })
    districtLayer.addTo(map)
  } catch (e) { console.warn('行政区加载失败:', e) }

  // ---------- 道路 GeoJSON ----------
  try {
    const roadRes = await fetch('/data/beijing_roads.geojson')
    const roadGeojson = await roadRes.json()

    const typeColors = { 高速: '#e74c3c', 快速路: '#3498db', 主干道: '#f39c12' }
    roadLayer = L.geoJSON(roadGeojson, {
      style: (feature) => {
        const t = feature.properties.type
        return { color: typeColors[t] || '#999', weight: t === '高速' ? 4 : t === '快速路' ? 3 : 2, opacity: 0.8 }
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<b>${feature.properties.name}</b><br/>类型: ${feature.properties.type}<br/>长度: ${feature.properties.length} km`)
      }
    })
    roadLayer.addTo(map)
  } catch (e) { console.warn('道路加载失败:', e) }
}

// ---------- 专题图 ----------
const applyThematic = () => {
  if (!districtLayer || !map) return
  legendItems.value = []

  if (thematicMode.value === 'choropleth') {
    // 分级设色：人口密度（5级，黄→红 顺序色带）
    legendTitle.value = '人口密度 (人/km²)'
    const colors = ['#ffffcc', '#feb24c', '#fc4e2a', '#bd0026', '#800026']
    const breaks = [2000, 5000, 10000, 20000]
    const labels = ['< 2,000', '2,000 - 5,000', '5,000 - 10,000', '10,000 - 20,000', '> 20,000']

    districtLayer.setStyle((feature) => {
      const d = feature.properties.density
      let ci = 0
      for (let i = 0; i < breaks.length; i++) { if (d >= breaks[i]) ci = i + 1 }
      return { fillColor: colors[ci], color: '#666', weight: 1.5, fillOpacity: 0.7 }
    })

    legendItems.value = labels.map((l, i) => ({ label: l, color: colors[i], shape: 'rect' }))
  } else if (thematicMode.value === 'proportional') {
    // 比例符号：按游客量映射符号大小
    legendTitle.value = '年游客量 (万人)'
    // 先恢复面样式
    districtLayer.setStyle((feature) => ({ fillColor: '#ccc', color: '#888', weight: 1, fillOpacity: 0.3 }))

    // 清除旧的符号
    districtLayer.eachLayer((layer) => {
      if (layer._proportionalMarker) {
        map.removeLayer(layer._proportionalMarker)
        layer._proportionalMarker = null
      }
    })

    // 从 POI 数据计算符号大小
    let maxVis = 1, minVis = Infinity
    if (poiLayer) {
      poiLayer.eachLayer((l) => {
        const v = l.feature?.properties?.visitors
        if (v > maxVis) maxVis = v
        if (v < minVis) minVis = v
      })
    }

    if (poiLayer) {
      poiLayer.eachLayer((l) => {
        const v = l.feature?.properties?.visitors || 0
        const r = 5 + (v - minVis) / (maxVis - minVis) * 25
        l.setIcon(L.divIcon({
          className: 'custom-poi-prop',
          html: `<div style="background:rgba(231,76,60,0.6);width:${r * 2}px;height:${r * 2}px;border-radius:50%;border:2px solid #c0392b;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
          iconSize: [r * 2, r * 2],
          iconAnchor: [r, r]
        }))
      })
    }

    legendItems.value = [
      { label: '500万', color: 'rgba(231,76,60,0.6)', size: '10px', shape: 'circle' },
      { label: '1000万', color: 'rgba(231,76,60,0.6)', size: '18px', shape: 'circle' },
      { label: '2000万', color: 'rgba(231,76,60,0.6)', size: '26px', shape: 'circle' },
      { label: '6000万', color: 'rgba(231,76,60,0.6)', size: '52px', shape: 'circle' }
    ]
  } else if (thematicMode.value === 'bivariate') {
    // 双变量地图：人口密度 + GDP
    legendTitle.value = '双变量地图 (密度+GDP)'
    
    // 定义颜色矩阵 - 红色表示密度，蓝色表示GDP
    const bivariateColors = [
      ['#f7f7f7', '#e8e8e8', '#d4d4d4'],
      ['#ffd4cc', '#f5b5ab', '#e88a7a'],
      ['#ff9980', '#ee6b4d', '#dc4a26']
    ]
    
    // 计算密度和GDP的分级
    let maxDensity = 0, minDensity = Infinity
    let maxGdp = 0, minGdp = Infinity
    
    districtLayer.eachLayer((layer) => {
      const p = layer.feature?.properties
      if (p) {
        if (p.density > maxDensity) maxDensity = p.density
        if (p.density < minDensity) minDensity = p.density
        if (p.gdp > maxGdp) maxGdp = p.gdp
        if (p.gdp < minGdp) minGdp = p.gdp
      }
    })
    
    districtLayer.setStyle((feature) => {
      const p = feature.properties
      // 归一化到 0-2 范围
      const densityNorm = Math.min(2, Math.floor(((p.density - minDensity) / (maxDensity - minDensity)) * 3))
      const gdpNorm = Math.min(2, Math.floor(((p.gdp - minGdp) / (maxGdp - minGdp)) * 3))
      return { 
        fillColor: bivariateColors[densityNorm][gdpNorm], 
        color: '#666', 
        weight: 1.5, 
        fillOpacity: 0.85 
      }
    })
    
    // 双变量图例
    legendItems.value = [
      { label: '密度→', color: 'transparent', shape: 'rect' },
      { label: 'GDP↓', color: 'transparent', shape: 'rect' },
      { label: '', color: '#f7f7f7', shape: 'rect' },
      { label: '', color: '#e8e8e8', shape: 'rect' },
      { label: '', color: '#d4d4d4', shape: 'rect' },
      { label: '', color: '#ffd4cc', shape: 'rect' },
      { label: '', color: '#f5b5ab', shape: 'rect' },
      { label: '', color: '#e88a7a', shape: 'rect' },
      { label: '', color: '#ff9980', shape: 'rect' },
      { label: '', color: '#ee6b4d', shape: 'rect' },
      { label: '', color: '#dc4a26', shape: 'rect' },
      { label: '低 GDP', color: 'transparent', shape: 'rect' },
      { label: '高 GDP', color: 'transparent', shape: 'rect' },
      { label: '低密度', color: 'transparent', shape: 'rect' },
      { label: '高密度', color: 'transparent', shape: 'rect' }
    ]
  } else {
    // 重置
    districtLayer.setStyle((feature) => ({ fillColor: '#4dac26', color: '#358022', weight: 1.5, fillOpacity: 0.2 }))

    if (poiLayer) {
      const catColors = { 景点: '#e74c3c', 教育: '#3498db', 商业: '#f39c12', 体育: '#2ecc71', 文化: '#9b59b6', 交通: '#8e44ad' }
      poiLayer.eachLayer((l) => {
        const cat = l.feature?.properties?.category || '景点'
        l.setIcon(L.divIcon({
          className: 'custom-poi',
          html: `<div style="background:${catColors[cat] || '#999'};width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          popupAnchor: [0, -9]
        }))
      })
    }
  }
}

// ---------- 书签 ----------
const bookmarks = [
  { id: 1, name: '天安门', icon: '🏛️', latlng: [39.9087, 116.3975], zoom: 15 },
  { id: 2, name: '故宫', icon: '🏯', latlng: [39.9158, 116.4039], zoom: 15 },
  { id: 3, name: '颐和园', icon: '🏞️', latlng: [39.9943, 116.2784], zoom: 14 },
  { id: 4, name: '国贸CBD', icon: '🏙️', latlng: [39.9105, 116.4655], zoom: 15 },
  { id: 5, name: '奥林匹克', icon: '🏟️', latlng: [39.9930, 116.3969], zoom: 14 },
  { id: 6, name: '北京全景', icon: '🌏', latlng: [39.908, 116.397], zoom: 11 }
]

const flyTo = (latlng, zoom) => {
  if (map) map.flyTo(latlng, zoom, { duration: 1.2 })
}

// ---------- 底图切换 ----------
const basemaps = [
  { id: 'street', icon: '🗺️', label: '街道地图' },
  { id: 'satellite', icon: '🛰️', label: '卫星地图' },
  { id: 'topo', icon: '⛰️', label: '地形图' },
  { id: 'hybrid', icon: '🔄', label: '混合地图' }
]

const switchBasemap = (id) => {
  if (!map || currentBasemap.value === id) return
  map.removeLayer(basemapLayers[currentBasemap.value])
  basemapLayers[id].addTo(map)
  currentBasemap.value = id
}

// ---------- 距离测量 ----------
const toggleMeasure = () => {
  measuring.value = !measuring.value
  if (!measuring.value) clearMeasure()
}

const clearMeasure = () => {
  measurePoints = []
  measureMarkers.forEach(m => map.removeLayer(m))
  measureMarkers = []
  if (measureLine) { map.removeLayer(measureLine); measureLine = null }
  measureResult.value = ''
}

const onMapClick = (e) => {
  if (!measuring.value || !map) return
  measurePoints.push(e.latlng)

  const marker = L.circleMarker(e.latlng, {
    radius: 5, color: '#e74c3c', fillColor: '#c0392b', fillOpacity: 1, weight: 2
  }).addTo(map)
  measureMarkers.push(marker)

  if (measurePoints.length > 1) {
    if (measureLine) map.removeLayer(measureLine)
    measureLine = L.polyline(measurePoints, { color: '#e74c3c', weight: 3, dashArray: '5,10' }).addTo(map)
  }

  // 计算总距离
  let total = 0
  for (let i = 1; i < measurePoints.length; i++) {
    total += measurePoints[i - 1].distanceTo(measurePoints[i])
  }
  measureResult.value = total > 1000 ? (total / 1000).toFixed(2) + ' km' : total.toFixed(0) + ' m'
}

// ---------- 标注编辑器 ----------
const toggleEdit = () => {
  editing.value = !editing.value
  if (editing.value) {
    map.on('click', onMapClickForEdit)
    map.getContainer().style.cursor = 'crosshair'
  } else {
    map.off('click', onMapClickForEdit)
    map.getContainer().style.cursor = ''
  }
}

const cancelEdit = () => {
  editing.value = false
  map.off('click', onMapClickForEdit)
  map.getContainer().style.cursor = ''
  newMarkerName.value = ''
  newMarkerCategory.value = '景点'
}

const onMapClickForEdit = (e) => {
  if (!editing.value || !map || !poiLayer) return
  
  const name = newMarkerName.value || '未命名标注'
  const category = newMarkerCategory.value
  const catColors = { 景点: '#e74c3c', 教育: '#3498db', 商业: '#f39c12', 体育: '#2ecc71', 文化: '#9b59b6', 交通: '#8e44ad' }
  
  const newFeature = {
    type: 'Feature',
    properties: {
      name: name,
      category: category,
      visitors: 0,
      rating: 0
    },
    geometry: {
      type: 'Point',
      coordinates: [e.latlng.lng, e.latlng.lat]
    }
  }
  
  const icon = L.divIcon({
    className: 'custom-poi',
    html: `<div style="background:${catColors[category]};width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9]
  })
  
  const marker = L.marker(e.latlng, { icon: icon })
    .bindPopup(`<b>${name}</b><br/>类别: ${category}`)
    .bindTooltip(name, { direction: 'top', offset: [0, -12] })
    .addTo(map)
  
  marker.feature = newFeature
  poiLayer.addLayer(marker)
  
  newMarkerName.value = ''
  newMarkerCategory.value = '景点'
}

// ---------- 清理 ----------
onUnmounted(() => {
  if (map) map.remove()
  map = null
})

defineExpose({ map })
</script>

<style scoped>
.leaflet-wrapper { position: relative; width: 100%; height: 100%; }
.map-el { width: 100%; height: 100%; z-index: 1; }
.map-loading {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.9); display: flex; align-items: center;
  justify-content: center; gap: 10px; z-index: 1000; font-size: 14px;
}
.spinner { width: 20px; height: 20px; border: 3px solid #ccc; border-top-color: #409eff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.basemap-ctrl {
  position: absolute; top: 10px; right: 10px; z-index: 500;
  display: flex; gap: 4px; background: #fff; border-radius: 8px;
  padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.bm-btn {
  width: 36px; height: 36px; border: none; border-radius: 6px;
  background: transparent; cursor: pointer; font-size: 18px;
  transition: all 0.2s; display: flex; align-items: center; justify-content: center;
}
.bm-btn:hover { background: #f0f0f0; }
.bm-btn.active { background: #409eff20; box-shadow: inset 0 0 0 2px #409eff; }

.bookmark-ctrl {
  position: absolute; top: 80px; right: 10px; z-index: 500;
  display: flex; flex-direction: column; gap: 3px;
  background: #fff; border-radius: 8px; padding: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.bm-item {
  border: none; background: transparent; cursor: pointer;
  padding: 5px 10px; border-radius: 4px; font-size: 12px;
  text-align: left; white-space: nowrap; transition: background 0.2s;
}
.bm-item:hover { background: #f0f0f0; }

.measure-ctrl {
  position: absolute; top: 10px; left: 50%; transform: translateX(-50%); z-index: 500;
  display: flex; align-items: center; gap: 8px;
  background: #fff; border-radius: 8px; padding: 6px 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.measure-btn {
  border: none; background: #409eff; color: #fff; border-radius: 4px;
  padding: 4px 12px; cursor: pointer; font-size: 13px; white-space: nowrap;
}
.measure-btn.active { background: #e74c3c; }
.measure-result { font-size: 13px; font-weight: 600; color: #333; min-width: 60px; }
.measure-clear { border: none; background: #eee; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 12px; line-height: 1; }

.thematic-ctrl {
  position: absolute; bottom: 30px; left: 10px; z-index: 500;
}
.thematic-ctrl select {
  padding: 6px 10px; border: 1px solid #ccc; border-radius: 6px;
  background: #fff; font-size: 13px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.legend-panel {
  position: absolute; bottom: 80px; left: 10px; z-index: 500;
  background: rgba(255,255,255,0.95); border-radius: 8px;
  padding: 10px 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  font-size: 12px; min-width: 140px;
}
.legend-panel h4 { margin: 0 0 6px; font-size: 13px; color: #333; }
.legend-row { display: flex; align-items: center; gap: 8px; margin: 3px 0; }
.legend-color { border: 1px solid rgba(0,0,0,0.15); flex-shrink: 0; }

.editor-ctrl {
  position: absolute; bottom: 30px; right: 10px; z-index: 500;
  display: flex; flex-direction: column; gap: 6px;
}
.edit-btn {
  border: none; background: #2ecc71; color: #fff; border-radius: 6px;
  padding: 6px 12px; cursor: pointer; font-size: 13px; 
  box-shadow: 0 2px 6px rgba(0,0,0,0.15); white-space: nowrap;
}
.edit-btn.active { background: #e74c3c; }
.edit-panel {
  background: #fff; border-radius: 8px; padding: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  display: flex; flex-direction: column; gap: 6px;
}
.edit-panel input, .edit-panel select {
  padding: 5px 8px; border: 1px solid #ddd; border-radius: 4px;
  font-size: 12px; min-width: 120px;
}
.edit-panel button {
  border: none; background: #ddd; color: #666; border-radius: 4px;
  padding: 4px 8px; cursor: pointer; font-size: 12px;
}
.edit-panel button:hover { background: #ccc; }
</style>