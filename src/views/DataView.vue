<template>
  <div class="data-view">
    <div class="data-header">
      <h2>图层数据管理</h2>
      <p class="data-desc">展示所有图层数据的统计信息、要素详情与空间分析</p>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-cards">
      <div class="overview-card" v-for="card in overviewCards" :key="card.label" :style="{ borderLeftColor: card.color }">
        <div class="card-num">{{ card.value }}</div>
        <div class="card-label">{{ card.label }}</div>
      </div>
    </div>

    <div class="data-grid">
      <!-- 图层统计表 -->
      <section class="data-card">
        <h3>图层概览</h3>
        <table class="stat-table">
          <thead>
            <tr>
              <th>图层名称</th>
              <th>类型</th>
              <th>要素数</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="layer in layerStats" :key="layer.id">
              <td>
                <span class="color-dot" :style="{ background: layer.color }"></span>
                {{ layer.name }}
              </td>
              <td><span class="type-tag">{{ layer.type }}</span></td>
              <td>{{ layer.count }}</td>
              <td>
                <span :class="['status-badge', layer.visible ? 'on' : 'off']">
                  {{ layer.visible ? '可见' : '隐藏' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 兴趣点列表 -->
      <section class="data-card">
        <h3>兴趣点列表 (POI)</h3>
        <div class="poi-list">
          <div class="poi-item" v-for="poi in poiList" :key="poi.name">
            <span class="poi-cat" :style="{ background: catColor(poi.category) }">{{ poi.category }}</span>
            <span class="poi-name">{{ poi.name }}</span>
            <span class="poi-coord">{{ poi.coord[1].toFixed(4) }}, {{ poi.coord[0].toFixed(4) }}</span>
          </div>
        </div>
      </section>

      <!-- 道路网络列表 -->
      <section class="data-card">
        <h3>道路网络</h3>
        <div class="road-list">
          <div class="road-item" v-for="road in roadList" :key="road.name">
            <span class="road-level" :style="{ background: road.color }">{{ road.level }}</span>
            <span class="road-name">{{ road.name }}</span>
            <span class="road-len">{{ road.length }} km</span>
          </div>
        </div>
      </section>

      <!-- 行政区划列表 -->
      <section class="data-card">
        <h3>行政区划</h3>
        <table class="stat-table">
          <thead>
            <tr>
              <th>区域</th>
              <th>面积</th>
              <th>人口</th>
              <th>密度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in districtList" :key="d.name">
              <td><span class="color-dot" :style="{ background: d.color }"></span>{{ d.name }}</td>
              <td>{{ d.area }}</td>
              <td>{{ d.population }}</td>
              <td>
                <span :class="['density-badge', d.density === '高' ? 'high' : d.density === '中' ? 'mid' : 'low']">
                  {{ d.density }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 空间分析 -->
      <section class="data-card">
        <h3>空间分析</h3>
        <div class="analysis-row">
          <span>覆盖范围 (bounding box):</span>
          <code>{{ bboxText }}</code>
        </div>
        <div class="analysis-row">
          <span>覆盖面积 (约):</span>
          <strong>{{ coverageArea }} km²</strong>
        </div>
        <div class="analysis-row">
          <span>道路总长度 (约):</span>
          <strong>{{ totalRoadLength }} km</strong>
        </div>
        <div class="analysis-row">
          <span>POI 平均密度:</span>
          <strong>{{ poiDensity }} 个/100km²</strong>
        </div>
      </section>

      <!-- 距离计算 -->
      <section class="data-card">
        <h3>距离计算演示 (Haversine公式)</h3>
        <div class="demo-row">
          <span>北京 → 上海 :</span>
          <strong>{{ dist.beijingToShanghai }} km</strong>
        </div>
        <div class="demo-row">
          <span>北京 → 广州 :</span>
          <strong>{{ dist.beijingToGuangzhou }} km</strong>
        </div>
        <div class="demo-row">
          <span>北京 → 成都 :</span>
          <strong>{{ dist.beijingToChengdu }} km</strong>
        </div>
        <div class="demo-row">
          <span>北京 → 哈尔滨 :</span>
          <strong>{{ dist.beijingToHarbin }} km</strong>
        </div>
        <div class="demo-row">
          <span>北京 → 乌鲁木齐 :</span>
          <strong>{{ dist.beijingToUrumqi }} km</strong>
        </div>
      </section>

      <!-- 坐标参考 -->
      <section class="data-card">
        <h3>坐标系参考</h3>
        <ul class="crs-info">
          <li><strong>地理坐标系:</strong> WGS84 (EPSG:4326)</li>
          <li><strong>投影坐标系:</strong> Web Mercator (EPSG:3857)</li>
          <li><strong>单位:</strong> 十进制度数 (Decimal Degrees)</li>
          <li><strong>地球半径:</strong> 6371 km (Haversine)</li>
          <li><strong>坐标顺序:</strong> [经度, 纬度] 存储 → Leaflet [纬度, 经度] 渲染</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMapStore } from '@/stores/mapStore.js'
import { calcDistance } from '@/modules/geoUtils.js'

const store = useMapStore()

// ========= 概览卡片数据 =========
const overviewCards = computed(() => [
  { label: '图层总数', value: store.layers.length, color: '#409eff' },
  { label: '可见图层', value: store.visibleLayerCount, color: '#67c23a' },
  { label: 'POI 点数', value: poiList.value.length, color: '#e74c3c' },
  { label: '道路条数', value: roadList.value.length, color: '#3498db' },
  { label: '行政区数', value: districtList.value.length, color: '#2ecc71' }
])

// ========= 图层统计 =========
const poiList = computed(() => [
  { coord: [39.9042, 116.4074], name: '北京天安门', category: '景点' },
  { coord: [39.9087, 116.3975], name: '故宫博物院', category: '景点' },
  { coord: [39.9997, 116.2756], name: '颐和园', category: '景点' },
  { coord: [39.9160, 116.3900], name: '景山公园', category: '景点' },
  { coord: [39.9230, 116.3830], name: '北海公园', category: '景点' },
  { coord: [39.9350, 116.4110], name: '雍和宫', category: '景点' },
  { coord: [39.8670, 116.4090], name: '天坛公园', category: '景点' },
  { coord: [40.0028, 116.3261], name: '清华大学', category: '教育' },
  { coord: [39.9923, 116.3103], name: '北京大学', category: '教育' },
  { coord: [39.9560, 116.3260], name: '北京航空航天大学', category: '教育' },
  { coord: [39.9700, 116.3000], name: '中国人民大学', category: '教育' },
  { coord: [39.9480, 116.3600], name: '北京师范大学', category: '教育' },
  { coord: [39.9375, 116.4311], name: '国贸CBD', category: '商业' },
  { coord: [39.9450, 116.3521], name: '西单商业区', category: '商业' },
  { coord: [39.9650, 116.3480], name: '中关村', category: '商业' },
  { coord: [39.9100, 116.4600], name: '三里屯太古里', category: '商业' },
  { coord: [39.9130, 116.4160], name: '王府井步行街', category: '商业' },
  { coord: [39.9050, 116.4340], name: '北京站', category: '交通枢纽' },
  { coord: [39.8980, 116.3800], name: '北京西站', category: '交通枢纽' },
  { coord: [39.8620, 116.4280], name: '北京南站', category: '交通枢纽' },
  { coord: [40.0800, 116.5850], name: '首都国际机场', category: '交通枢纽' },
  { coord: [39.9900, 116.2910], name: '奥林匹克森林公园', category: '公园' },
  { coord: [39.9400, 116.4390], name: '朝阳公园', category: '公园' },
  { coord: [39.8700, 116.3530], name: '陶然亭公园', category: '公园' }
])

const roadList = computed(() => [
  { name: '机场高速', level: '高速', length: '15.0', color: '#e74c3c' },
  { name: '京通快速', level: '高速', length: '12.0', color: '#e74c3c' },
  { name: '京藏高速（G6）', level: '高速', length: '19.5', color: '#e74c3c' },
  { name: '京港澳高速（G4）', level: '高速', length: '18.0', color: '#e74c3c' },
  { name: '二环路', level: '环路', length: '32.7', color: '#3498db' },
  { name: '三环路', level: '环路', length: '48.0', color: '#3498db' },
  { name: '四环路', level: '环路', length: '65.3', color: '#3498db' },
  { name: '五环路', level: '环路', length: '98.6', color: '#3498db' },
  { name: '长安街', level: '主干', length: '7.5', color: '#f39c12' },
  { name: '中轴线（南段）', level: '主干', length: '6.0', color: '#f39c12' },
  { name: '西三环南路', level: '次干', length: '4.5', color: '#7f8c8d' },
  { name: '广安门外大街', level: '次干', length: '3.0', color: '#7f8c8d' },
  { name: '朝阳门外大街', level: '次干', length: '3.0', color: '#7f8c8d' },
  { name: '东四大街', level: '次干', length: '3.0', color: '#7f8c8d' },
  { name: '新街口外大街', level: '次干', length: '3.0', color: '#7f8c8d' }
])

const districtList = computed(() => [
  { name: '东城区', area: '41.84 km²', population: '约 87 万', density: '高', color: '#2ecc71' },
  { name: '西城区', area: '50.70 km²', population: '约 113 万', density: '高', color: '#27ae60' },
  { name: '朝阳区', area: '470.8 km²', population: '约 385 万', density: '中', color: '#1abc9c' },
  { name: '海淀区', area: '431.0 km²', population: '约 369 万', density: '中', color: '#16a085' },
  { name: '丰台区', area: '306.0 km²', population: '约 232 万', density: '中', color: '#8e44ad' },
  { name: '房山区', area: '2019 km²', population: '约 131 万', density: '低', color: '#e74c3c' }
])

const layerStats = computed(() => [
  { id: 'layer-1', name: '兴趣点 (POI)', type: 'Point', count: poiList.value.length, color: '#e74c3c', visible: true },
  { id: 'layer-2', name: '道路网络', type: 'LineString', count: roadList.value.length, color: '#3498db', visible: true },
  { id: 'layer-3', name: '行政区划', type: 'Polygon', count: districtList.value.length, color: '#2ecc71', visible: true }
])

// ========= 空间分析 =========
const allCoords = computed(() => poiList.value.map(p => p.coord))
const bboxText = computed(() => {
  const coords = allCoords.value
  const lats = coords.map(c => c[0])
  const lngs = coords.map(c => c[1])
  return `[${Math.min(...lngs).toFixed(4)}, ${Math.min(...lats).toFixed(4)}] ~ [${Math.max(...lngs).toFixed(4)}, ${Math.max(...lats).toFixed(4)}]`
})

const coverageArea = computed(() => {
  const coords = allCoords.value
  const lats = coords.map(c => c[0])
  const lngs = coords.map(c => c[1])
  const meanLat = lats.reduce((a, b) => a + b, 0) / lats.length
  const dlat = (Math.max(...lats) - Math.min(...lats)) * 111
  const dlng = (Math.max(...lngs) - Math.min(...lngs)) * 111 * Math.cos(meanLat * Math.PI / 180)
  return (dlat * dlng).toFixed(1)
})

const totalRoadLength = computed(() => roadList.value.reduce((s, r) => s + parseFloat(r.length), 0).toFixed(1))

const poiDensity = computed(() => {
  const area = parseFloat(coverageArea.value)
  return area > 0 ? ((poiList.value.length / area) * 100).toFixed(2) : '0'
})

// ========= 距离计算 =========
const BJ = [116.4074, 39.9042]
const dist = computed(() => ({
  beijingToShanghai: calcDistance(BJ, [121.4737, 31.2304]).toFixed(2),
  beijingToGuangzhou: calcDistance(BJ, [113.2644, 23.1291]).toFixed(2),
  beijingToChengdu: calcDistance(BJ, [104.0657, 30.6598]).toFixed(2),
  beijingToHarbin: calcDistance(BJ, [126.6424, 45.8038]).toFixed(2),
  beijingToUrumqi: calcDistance(BJ, [87.6168, 43.8256]).toFixed(2)
}))

// ========= 工具函数 =========
const catColor = (cat) => {
  const map = { '景点': '#e74c3c', '教育': '#3498db', '商业': '#f39c12', '交通枢纽': '#8e44ad', '公园': '#27ae60' }
  return map[cat] || '#999'
}
</script>

<style scoped>
.data-view {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}

.data-header {
  margin-bottom: 20px;
}

.data-header h2 {
  font-size: 20px;
  color: var(--accent-color);
}

.data-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 4px;
}

/* 概览卡片 */
.overview-cards {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.overview-card {
  flex: 1;
  min-width: 130px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-left: 4px solid;
  border-radius: 8px;
  padding: 12px 16px;
  text-align: center;
}

.card-num {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
}

.card-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* 数据卡片网格 */
.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.data-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

.data-card h3 {
  font-size: 15px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

/* 统计表格 */
.stat-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.stat-table th,
.stat-table td {
  padding: 7px 10px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.stat-table th {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 12px;
}

.color-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.type-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--hover-bg);
  color: var(--text-secondary);
}

.status-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}
.status-badge.on { background: #e8f5e9; color: #2e7d32; }
.status-badge.off { background: #fce4ec; color: #c62828; }

/* POI 列表 */
.poi-list {
  max-height: 300px;
  overflow-y: auto;
}

.poi-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
}
.poi-item:last-child { border-bottom: none; }

.poi-cat {
  font-size: 10px;
  color: #fff;
  padding: 1px 6px;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}

.poi-name {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
}

.poi-coord {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  font-family: 'Consolas', monospace;
}

/* 道路列表 */
.road-list {
  max-height: 300px;
  overflow-y: auto;
}

.road-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
}
.road-item:last-child { border-bottom: none; }

.road-level {
  font-size: 10px;
  color: #fff;
  padding: 1px 6px;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
  width: 36px;
  text-align: center;
}

.road-name { flex: 1; color: var(--text-primary); }
.road-len { font-size: 11px; color: var(--text-secondary); white-space: nowrap; }

/* 密度标签 */
.density-badge {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 500;
}
.density-badge.high { background: #fce4ec; color: #c62828; }
.density-badge.mid { background: #fff3e0; color: #ef6c00; }
.density-badge.low { background: #e8f5e9; color: #2e7d32; }

/* 空间分析 */
.analysis-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--border-color);
}
.analysis-row:last-child { border-bottom: none; }
.analysis-row code {
  font-family: 'Consolas', monospace;
  font-size: 11px;
  color: var(--accent-color);
}

/* 距离演示 */
.demo-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
}
.demo-row:last-child { border-bottom: none; }

/* CRS 信息 */
.crs-info {
  font-size: 13px;
  padding-left: 16px;
  color: var(--text-secondary);
}
.crs-info li {
  margin-bottom: 4px;
  line-height: 1.6;
}

/* 响应式 */
@media (max-width: 768px) {
  .data-grid { grid-template-columns: 1fr; }
  .overview-cards { flex-direction: column; }
}
</style>