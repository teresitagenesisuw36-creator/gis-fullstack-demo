<template>
  <div class="portfolio-view">
    <!-- 顶部信息栏 -->
    <header class="portfolio-header">
      <h1>个人 GIS 作品集</h1>
      <p class="subtitle">基于 Leaflet 1.9 + MapLibre GL JS 的 WebGIS 二维开发实验</p>
      <div class="meta">北京市 GIS 数据可视化 | 2026-06</div>
    </header>

    <!-- 标签页切换 -->
    <div class="tab-bar">
      <button v-for="tab in tabs" :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id">
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <div class="tab-content">
      <!-- ========== Leaflet 专题地图 ========== -->
      <div v-show="activeTab === 'leaflet'" class="tab-panel leaflet-panel">
        <div class="panel-sidebar">
          <h3>功能说明</h3>
          <ul class="feature-list">
            <li><strong>多底图切换</strong>：街道/卫星/地形/混合四种底图</li>
            <li><strong>地图书签</strong>：一键跳转天安门、故宫、颐和园等地标</li>
            <li><strong>距离测量</strong>：点击地图多点测距</li>
            <li><strong>比例尺</strong>：左下角公制比例尺</li>
            <li><strong>分级设色图</strong>：人口密度 YlOrRd 顺序色带 5 级</li>
            <li><strong>比例符号图</strong>：POI 游客量映射符号半径</li>
            <li><strong>双变量地图</strong>：人口密度 + GDP 双重属性可视化（高级功能）</li>
            <li><strong>标注编辑器</strong>：点击添加自定义 POI 标注（高级功能）</li>
            <li><strong>POI 标注</strong>：自定义分类图标 + Popup + Tooltip</li>
            <li><strong>道路网络</strong>：高速/快速路/主干道分级渲染</li>
            <li><strong>行政区划</strong>：面要素填充 + 交互弹窗</li>
          </ul>

          <h3>专题图配色方案</h3>
          <table class="color-table">
            <thead><tr><th>地图</th><th>色带</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>分级设色</td><td><span class="swatch" v-for="c in ['#ffffcc','#feb24c','#fc4e2a','#bd0026','#800026']" :key="c" :style="{ background: c }"></span></td><td>YlOrRd 5级顺序色带，低→高密度：浅黄→深红</td></tr>
              <tr><td>双变量</td><td><span class="swatch" style="background:#f7f7f7"></span><span class="swatch" style="background:#ff9980"></span><span class="swatch" style="background:#d4d4d4"></span><span class="swatch" style="background:#dc4a26"></span></td><td>红色表密度，灰度表GDP，左上低密度低GDP，右下高密度高GDP</td></tr>
              <tr><td>比例符号</td><td><span class="swatch" style="background:rgba(231,76,60,0.6)"></span></td><td>半透明红，符号面积与游客量成正比</td></tr>
              <tr><td>道路</td><td><span class="swatch" style="background:#e74c3c"></span><span class="swatch" style="background:#3498db"></span><span class="swatch" style="background:#f39c12"></span></td><td>高速红/快速路蓝/主干道橙，视觉层次清晰</td></tr>
              <tr><td>POI</td><td><span class="swatch" style="background:#e74c3c"></span><span class="swatch" style="background:#3498db"></span><span class="swatch" style="background:#f39c12"></span><span class="swatch" style="background:#2ecc71"></span><span class="swatch" style="background:#9b59b6"></span><span class="swatch" style="background:#8e44ad"></span></td><td>景点红/教育蓝/商业橙/体育绿/文化紫/交通紫红</td></tr>
            </tbody>
          </table>

          <h3>数据概览</h3>
          <div class="data-stats">
            <div class="stat-item"><span class="stat-num">10</span><span class="stat-label">行政区</span></div>
            <div class="stat-item"><span class="stat-num">20</span><span class="stat-label">POI 点</span></div>
            <div class="stat-item"><span class="stat-num">10</span><span class="stat-label">道路</span></div>
          </div>
        </div>

        <div class="panel-map">
          <LeafletMap @loaded="onLeafletLoaded" @coord-update="onCoordUpdate" />
        </div>
      </div>

      <!-- ========== MapLibre 矢量瓦片 ========== -->
      <div v-show="activeTab === 'maplibre'" class="tab-panel maplibre-panel">
        <div class="panel-sidebar">
          <h3>功能说明</h3>
          <ul class="feature-list">
            <li><strong>矢量瓦片底图</strong>：MapLibre Style JSON 驱动</li>
            <li><strong>GeoJSON 数据源</strong>：动态加载行政区/POI/道路数据</li>
            <li><strong>数据驱动样式</strong>：人口密度 fill-color 插值、POI 分类配色</li>
            <li><strong>样式切换</strong>：标准/暗色/亮色三套主题</li>
            <li><strong>点聚合</strong>：POI 聚类渲染 + 层级钻取</li>
            <li><strong>3D 建筑拉伸</strong>：fill-extrusion + pitch 倾斜视角</li>
            <li><strong>交互弹窗</strong>：点击要素显示属性信息</li>
          </ul>

          <h3>图层结构</h3>
          <table class="layer-table">
            <thead><tr><th>图层 ID</th><th>类型</th><th>数据源</th></tr></thead>
            <tbody>
              <tr><td>district-fill</td><td>fill</td><td>beijing_districts.geojson</td></tr>
              <tr><td>district-line</td><td>line</td><td>beijing_districts.geojson</td></tr>
              <tr><td>district-labels</td><td>symbol</td><td>beijing_districts.geojson</td></tr>
              <tr><td>poi-clusters</td><td>circle</td><td>beijing_pois.geojson</td></tr>
              <tr><td>poi-points</td><td>circle</td><td>beijing_pois.geojson</td></tr>
              <tr><td>poi-labels</td><td>symbol</td><td>beijing_pois.geojson</td></tr>
              <tr><td>roads-line</td><td>line</td><td>beijing_roads.geojson</td></tr>
              <tr><td>roads-labels</td><td>symbol</td><td>beijing_roads.geojson</td></tr>
            </tbody>
          </table>

          <h3>部署说明</h3>
          <div class="deploy-info">
            <p><strong>技术栈</strong>: Vite 6 + Vue 3.5 + Leaflet 1.9.4 + MapLibre GL JS 5.x + Pinia</p>
            <p><strong>构建</strong>: <code>npm run build</code></p>
            <p><strong>部署</strong>: 静态文件，可部署至 GitHub Pages / Vercel / Netlify</p>
            <p><strong>GeoJSON 数据</strong>: <code>public/data/</code> 目录下的三个文件</p>
          </div>
        </div>

        <div class="panel-map">
          <MapLibreMap @loaded="onMapLibreLoaded" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LeafletMap from '@/components/LeafletMap.vue'
import MapLibreMap from '@/components/MapLibreMap.vue'

const activeTab = ref('leaflet')

const tabs = [
  { id: 'leaflet', label: 'Leaflet 专题图', icon: '🗺️' },
  { id: 'maplibre', label: 'MapLibre 矢量瓦片', icon: '🧩' }
]

const onLeafletLoaded = () => { console.log('Leaflet 地图已加载') }
const onMapLibreLoaded = () => { console.log('MapLibre 地图已加载') }
const onCoordUpdate = (coord) => { /* 坐标更新 */ }
</script>

<style scoped>
.portfolio-view {
  display: flex; flex-direction: column;
  height: calc(100vh - 50px); /* 减去顶栏高度 */
  background: var(--bg-color, #f5f7fa);
}

.portfolio-header {
  padding: 12px 24px 8px;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: #fff; flex-shrink: 0;
}
.portfolio-header h1 { margin: 0; font-size: 20px; }
.portfolio-header .subtitle { margin: 4px 0; font-size: 13px; opacity: 0.85; }
.portfolio-header .meta { font-size: 11px; opacity: 0.65; }

.tab-bar {
  display: flex; gap: 4px; padding: 8px 24px;
  background: #fff; border-bottom: 1px solid #e8e8e8; flex-shrink: 0;
}
.tab-btn {
  padding: 6px 16px; border: 1px solid #ddd; border-radius: 6px;
  background: #fff; cursor: pointer; font-size: 13px;
  transition: all 0.2s;
}
.tab-btn:hover { background: #f0f0f0; }
.tab-btn.active { background: #409eff; color: #fff; border-color: #409eff; }

.tab-content { flex: 1; overflow: hidden; }

.tab-panel { display: flex; height: 100%; }

.panel-sidebar {
  width: 320px; flex-shrink: 0; padding: 14px;
  background: #fff; border-right: 1px solid #e8e8e8;
  overflow-y: auto; font-size: 13px;
}
.panel-sidebar h3 { font-size: 14px; color: #2c3e50; border-bottom: 2px solid #409eff; padding-bottom: 4px; margin: 14px 0 8px; }
.panel-sidebar h3:first-child { margin-top: 0; }

.feature-list { margin: 0; padding-left: 18px; }
.feature-list li { margin: 3px 0; color: #555; line-height: 1.5; }

.color-table, .layer-table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 6px 0; }
.color-table th, .color-table td, .layer-table th, .layer-table td { border: 1px solid #e8e8e8; padding: 3px 6px; text-align: left; }
.color-table th, .layer-table th { background: #f8f9fa; font-weight: 600; }

.swatch { display: inline-block; width: 14px; height: 14px; border-radius: 2px; border: 1px solid rgba(0,0,0,0.1); margin-right: 2px; }

.data-stats { display: flex; gap: 12px; margin: 8px 0; }
.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-num { font-size: 22px; font-weight: 700; color: #409eff; }
.stat-label { font-size: 11px; color: #888; }

.deploy-info { font-size: 12px; color: #555; line-height: 1.6; }
.deploy-info code { background: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 11px; }

.panel-map { flex: 1; min-width: 0; position: relative; }
</style>