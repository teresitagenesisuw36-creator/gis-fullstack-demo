<template>
  <div class="maplibre-wrapper">
    <div ref="mapEl" class="map-el"></div>

    <div v-if="loading" class="map-loading">
      <div class="spinner"></div><span>加载 MapLibre 地图...</span>
    </div>

    <!-- 样式切换器 -->
    <div class="style-switcher">
      <select v-model="currentStyle" @change="switchStyle">
        <option v-for="s in styles" :key="s.id" :value="s.id">{{ s.label }}</option>
      </select>
    </div>

    <!-- 3D 建筑控制 -->
    <div class="building-ctrl">
      <label>
        <input type="checkbox" v-model="show3D" @change="toggle3D" /> 3D 建筑
      </label>
      <input v-if="show3D" type="range" min="0" max="500" v-model.number="buildingHeight" @input="update3DHeight" title="建筑高度系数" />
    </div>

    <!-- 点聚合控制 -->
    <div class="cluster-ctrl">
      <label>
        <input type="checkbox" v-model="clusterEnabled" @change="toggleCluster" /> 点聚合
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// 使用 CDN 全局变量
const maplibregl = window.maplibregl

const emit = defineEmits(['loaded'])

const mapEl = ref(null)
const loading = ref(true)
const currentStyle = ref('streets')
const show3D = ref(true)
const buildingHeight = ref(100)
const clusterEnabled = ref(true)

let map = null

// 样式配置
const styles = [
  { id: 'streets', label: '标准街道', url: 'https://demotiles.maplibre.org/style.json' },
  { id: 'dark', label: '暗色主题', url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' },
  { id: 'light', label: '亮色主题', url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' }
]

onMounted(async () => {
  await nextTick()
  initMap()
})

const initMap = () => {
  if (!mapEl.value) return

  map = new maplibregl.Map({
    container: mapEl.value,
    style: styles[0].url,
    center: [116.397, 39.908],
    zoom: 12,
    pitch: 45,
    bearing: 0,
    antialias: true
  })

  map.addControl(new maplibregl.NavigationControl(), 'bottom-right')
  map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

  map.on('load', () => {
    addGeoJSONLayers()
    loading.value = false
    emit('loaded')
  })
}

const addGeoJSONLayers = () => {
  if (!map) return

  // 添加 POI 数据源
  map.addSource('beijing-pois', {
    type: 'geojson',
    data: '/data/beijing_pois.geojson',
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  })

  // 点聚合层（聚类圆）
  map.addLayer({
    id: 'poi-clusters',
    type: 'circle',
    source: 'beijing-pois',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 5, '#f1f075', 10, '#f28cb1'],
      'circle-radius': ['step', ['get', 'point_count'], 15, 5, 25, 10, 35],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  })

  // 聚类数量标注
  map.addLayer({
    id: 'poi-cluster-count',
    type: 'symbol',
    source: 'beijing-pois',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['Open Sans Bold'],
      'text-size': 13
    },
    paint: { 'text-color': '#333' }
  })

  // POI 单独点
  map.addLayer({
    id: 'poi-points',
    type: 'circle',
    source: 'beijing-pois',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': ['match', ['get', 'category'],
        '景点', '#e74c3c',
        '教育', '#3498db',
        '商业', '#f39c12',
        '体育', '#2ecc71',
        '文化', '#9b59b6',
        '交通', '#8e44ad',
        '#999'
      ],
      'circle-radius': ['interpolate', ['linear'], ['zoom'],
        10, 4,
        15, 12
      ],
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#fff'
    }
  })

  // POI 名称标签
  map.addLayer({
    id: 'poi-labels',
    type: 'symbol',
    source: 'beijing-pois',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Open Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 12, 8, 15, 11],
      'text-offset': [0, 1.5],
      'text-anchor': 'top'
    },
    paint: {
      'text-color': '#333',
      'text-halo-color': '#fff',
      'text-halo-width': 1.5
    },
    minzoom: 12
  })

  // 添加行政区数据源
  map.addSource('beijing-districts', {
    type: 'geojson',
    data: '/data/beijing_districts.geojson'
  })

  // 行政区填充
  map.addLayer({
    id: 'district-fill',
    type: 'fill',
    source: 'beijing-districts',
    paint: {
      'fill-color': ['interpolate', ['linear'], ['get', 'density'],
        1299, '#fee5d9',
        3000, '#fcae91',
        7000, '#fb6a4a',
        15000, '#de2d26',
        22000, '#a50f15'
      ],
      'fill-opacity': 0.5
    }
  })

  // 行政区边界
  map.addLayer({
    id: 'district-line',
    type: 'line',
    source: 'beijing-districts',
    paint: {
      'line-color': '#666',
      'line-width': 1.5
    }
  })

  // 行政区名称
  map.addLayer({
    id: 'district-labels',
    type: 'symbol',
    source: 'beijing-districts',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Open Sans Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': '#333',
      'text-halo-color': '#fff',
      'text-halo-width': 2
    }
  })

  // 添加道路数据源
  map.addSource('beijing-roads', {
    type: 'geojson',
    data: '/data/beijing_roads.geojson'
  })

  // 道路线
  map.addLayer({
    id: 'roads-line',
    type: 'line',
    source: 'beijing-roads',
    paint: {
      'line-color': ['match', ['get', 'type'],
        '高速', '#e74c3c',
        '快速路', '#3498db',
        '主干道', '#f39c12',
        '#999'
      ],
      'line-width': ['match', ['get', 'type'],
        '高速', 3,
        '快速路', 2.5,
        '主干道', 2,
        1.5
      ],
      'line-opacity': 0.8
    }
  })

  // 道路名称
  map.addLayer({
    id: 'roads-labels',
    type: 'symbol',
    source: 'beijing-roads',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Open Sans Regular'],
      'text-size': 10,
      'symbol-placement': 'line',
      'text-rotation-alignment': 'map'
    },
    paint: {
      'text-color': '#444',
      'text-halo-color': '#fff',
      'text-halo-width': 2
    }
  })

  // 点击事件
  map.on('click', 'poi-points', (e) => {
    const props = e.features[0].properties
    new maplibregl.Popup({ offset: 14 })
      .setLngLat(e.lngLat)
      .setHTML(`<b>${props.name}</b><br/>类别: ${props.category}<br/>年游客量: ${props.visitors.toLocaleString()}`)
      .addTo(map)
  })

  map.on('click', 'poi-clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['poi-clusters'] })
    const clusterId = features[0].properties.cluster_id
    map.getSource('beijing-pois').getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return
      map.easeTo({ center: features[0].geometry.coordinates, zoom })
    })
  })

  map.on('click', 'district-fill', (e) => {
    const props = e.features[0].properties
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`<b>${props.name}</b><br/>人口: ${props.population.toLocaleString()}<br/>密度: ${props.density} 人/km²<br/>GDP: ${props.gdp} 亿元`)
      .addTo(map)
  })

  map.on('click', 'roads-line', (e) => {
    const props = e.features[0].properties
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`<b>${props.name}</b><br/>类型: ${props.type}<br/>长度: ${props.length} km<br/>车道: ${props.lanes}`)
      .addTo(map)
  })

  // 光标
  map.on('mouseenter', 'poi-points', () => map.getCanvas().style.cursor = 'pointer')
  map.on('mouseleave', 'poi-points', () => map.getCanvas().style.cursor = '')
  map.on('mouseenter', 'poi-clusters', () => map.getCanvas().style.cursor = 'pointer')
  map.on('mouseleave', 'poi-clusters', () => map.getCanvas().style.cursor = '')
  map.on('mouseenter', 'district-fill', () => map.getCanvas().style.cursor = 'pointer')
  map.on('mouseleave', 'district-fill', () => map.getCanvas().style.cursor = '')
}

// 样式切换
const switchStyle = () => {
  const style = styles.find(s => s.id === currentStyle.value)
  if (style && map) {
    map.setStyle(style.url)
    map.once('style.load', () => addGeoJSONLayers())
  }
}

// 3D 建筑拉伸（如果底图包含建筑数据）
const toggle3D = () => {
  if (!map) return
  if (show3D.value) {
    map.setPitch(45)
  } else {
    map.setPitch(0)
  }
}

const update3DHeight = () => {
  // 通过 fill-extrusion 属性调整（若底图有建筑图层）
  if (map && map.getLayer('building-extrusion')) {
    map.setPaintProperty('building-extrusion', 'fill-extrusion-height', buildingHeight.value)
  }
}

// 点聚合切换
const toggleCluster = () => {
  if (!map) return
  if (clusterEnabled.value) {
    map.setLayoutProperty('poi-clusters', 'visibility', 'visible')
    map.setLayoutProperty('poi-cluster-count', 'visibility', 'visible')
  } else {
    map.setLayoutProperty('poi-clusters', 'visibility', 'none')
    map.setLayoutProperty('poi-cluster-count', 'visibility', 'none')
  }
}

onUnmounted(() => {
  if (map) map.remove()
  map = null
})

defineExpose({ map })
</script>

<style scoped>
.maplibre-wrapper { position: relative; width: 100%; height: 100%; }
.map-el { width: 100%; height: 100%; }
.map-loading {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.9); display: flex; align-items: center;
  justify-content: center; gap: 10px; z-index: 1000; font-size: 14px;
}
.spinner { width: 20px; height: 20px; border: 3px solid #ccc; border-top-color: #409eff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.style-switcher {
  position: absolute; top: 10px; right: 10px; z-index: 500;
}
.style-switcher select {
  padding: 6px 10px; border: 1px solid #ccc; border-radius: 6px;
  background: #fff; font-size: 13px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.building-ctrl {
  position: absolute; top: 50px; right: 10px; z-index: 500;
  background: rgba(255,255,255,0.9); border-radius: 8px; padding: 8px 12px;
  font-size: 13px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  display: flex; flex-direction: column; gap: 4px;
}
.building-ctrl label { display: flex; align-items: center; gap: 4px; cursor: pointer; }
.building-ctrl input[type="range"] { width: 100px; }

.cluster-ctrl {
  position: absolute; top: 140px; right: 10px; z-index: 500;
  background: rgba(255,255,255,0.9); border-radius: 8px; padding: 6px 10px;
  font-size: 13px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.cluster-ctrl label { display: flex; align-items: center; gap: 4px; cursor: pointer; }
</style>