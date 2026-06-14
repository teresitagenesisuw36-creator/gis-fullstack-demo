<template>
  <div class="about-view">
    <div class="about-card">
      <!-- 头部 -->
      <h1>GIS 应用前端框架</h1>
      <p class="subtitle">基于 Vite 6 + Vue 3.5 + Pinia + Vue Router</p>
      <p class="version">v1.0.0 | 2026-06-10</p>

      <!-- 实验说明 -->
      <section class="about-section">
        <h2>实验说明</h2>
        <div class="exp-desc">
          <p><strong>实验名称：</strong>Web前端开发基础与GIS应用框架搭建</p>
          <p><strong>实验目的：</strong>掌握现代前端工程化开发方法，构建GIS应用前端框架，实现界面设计、数据处理、状态管理和路由控制等核心功能。</p>
          <p><strong>实验要求：</strong></p>
          <ul class="tech-list">
            <li>使用Vue3组合式API进行组件开发</li>
            <li>实现Pinia全局状态管理（含持久化）</li>
            <li>集成Leaflet地图引擎与国产瓦片服务</li>
            <li>支持空间数据渲染（点、线、面要素）</li>
            <li>实现路由懒加载与导航守卫</li>
            <li>支持浅色/深色主题切换</li>
            <li>桌面端/移动端响应式适配</li>
          </ul>
        </div>
      </section>

      <!-- 技术栈 -->
      <section class="about-section">
        <h2>技术栈</h2>
        <div class="tech-grid">
          <div class="tech-item">
            <div class="tech-icon">⚡</div>
            <strong>Vite 6</strong>
            <span>构建工具</span>
          </div>
          <div class="tech-item">
            <div class="tech-icon">💚</div>
            <strong>Vue 3.5</strong>
            <span>UI 框架</span>
          </div>
          <div class="tech-item">
            <div class="tech-icon">🍍</div>
            <strong>Pinia</strong>
            <span>状态管理</span>
          </div>
          <div class="tech-item">
            <div class="tech-icon">🧭</div>
            <strong>Vue Router 4</strong>
            <span>路由控制</span>
          </div>
          <div class="tech-item">
            <div class="tech-icon">🗺️</div>
            <strong>Leaflet</strong>
            <span>地图引擎</span>
          </div>
          <div class="tech-item">
            <div class="tech-icon">🎨</div>
            <strong>CSS3</strong>
            <span>样式系统</span>
          </div>
        </div>
      </section>

      <!-- 功能特性 -->
      <section class="about-section">
        <h2>功能特性</h2>
        <ul class="tech-list feature-list">
          <li>浅色/深色主题切换（CSS 变量 + Pinia 持久化）</li>
          <li>桌面端/移动端响应式适配（Flex / Grid 布局）</li>
          <li>GIS 空间数据处理工具函数（距离计算、坐标格式化、面积统计）</li>
          <li>GeoJSON 异步加载与处理模块</li>
          <li>图层数据模型（ES6 Class 封装）</li>
          <li>图层可见性控制、透明度调节、搜索过滤</li>
          <li>实时鼠标经纬度显示</li>
          <li>地图工具栏与状态联动（平移、缩放、测距、识别）</li>
          <li>多底图切换（街道地图 / 卫星地图 / 混合地图）</li>
          <li>分类 POI 图标系统（景点、教育、商业、交通、公园）</li>
          <li>道路分级渲染（高速 / 环路 / 主干 / 次干）</li>
          <li>行政区划面要素渲染（含人口、面积、密度数据）</li>
          <li>Composables 逻辑复用（useLayers、useTheme）</li>
          <li>Pinia 状态持久化（localStorage）</li>
          <li>路由懒加载与权限控制（beforeEach 全局守卫）</li>
        </ul>
      </section>

      <!-- 项目结构 -->
      <section class="about-section">
        <h2>项目结构</h2>
        <pre class="structure">
gis-app/
├── src/
│   ├── components/           # 可复用组件
│   │   ├── TopBar.vue            # 顶栏 + 导航 + 主题切换
│   │   ├── SideBar.vue           # 侧边栏 + 图层控制
│   │   ├── MapArea.vue           # 地图主区域（核心）
│   │   ├── StatusBar.vue         # 底部状态栏
│   │   ├── CoordinateDisplay.vue  # 鼠标坐标实时显示
│   │   ├── LayerList.vue         # 图层列表
│   │   ├── MapToolbar.vue        # 地图工具栏
│   │   └── LayerSearch.vue       # 图层搜索
│   ├── views/                # 页面视图
│   │   ├── MapView.vue
│   │   ├── DataView.vue
│   │   └── AboutView.vue
│   ├── router/index.js       # 路由配置
│   ├── stores/mapStore.js    # Pinia 状态管理
│   ├── composables/          # 可复用逻辑
│   │   └── useLayers.js
│   ├── modules/              # GIS 工具模块
│   │   ├── geoUtils.js           # 空间计算工具
│   │   └── geoJSONProcessor.js   # GeoJSON 处理器
│   ├── models/LayerModel.js  # 图层数据模型
│   └── styles/variables.css  # CSS 变量/主题/过渡
├── index.html
├── package.json
└── vite.config.js
        </pre>
      </section>

      <!-- 数据统计 -->
      <section class="about-section">
        <h2>数据概览</h2>
        <div class="stats-row">
          <div class="stat-box">
            <div class="stat-num">24</div>
            <div class="stat-label">POI 兴趣点</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">15</div>
            <div class="stat-label">道路线</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">6</div>
            <div class="stat-label">行政区划</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">3</div>
            <div class="stat-label">图层</div>
          </div>
        </div>
      </section>

      <!-- 联系方式 -->
      <section class="about-section">
        <h2>联系方式</h2>
        <div class="contact-info">
          <p>如有问题或建议，请联系课程教师或助教。</p>
          <p class="contact-note">本应用为实验课程演示项目，仅供学习参考。</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
// 纯静态展示页，无响应式数据需求
</script>

<style scoped>
.about-view {
  padding: 24px;
  overflow-y: auto;
  height: 100%;
}

.about-card {
  max-width: 740px;
  margin: 0 auto;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 28px;
  box-shadow: var(--shadow);
}

.about-card h1 {
  font-size: 24px;
  color: var(--accent-color);
  text-align: center;
  margin-bottom: 0;
}

.subtitle {
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 6px;
}

.version {
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.7;
}

.about-section {
  margin-top: 24px;
}

.about-section h2 {
  font-size: 17px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--accent-color);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.exp-desc p {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.7;
}

.tech-list {
  font-size: 13px;
  padding-left: 18px;
  color: var(--text-secondary);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 4px 12px;
}

.tech-list li {
  margin-bottom: 4px;
  line-height: 1.6;
}

.feature-list {
  grid-template-columns: 1fr;
}

/* 技术栈网格 */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.tech-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px 8px;
  text-align: center;
  transition: all 0.2s;
}

.tech-item:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
}

.tech-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.tech-item strong {
  display: block;
  font-size: 13px;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.tech-item span {
  font-size: 11px;
  color: var(--text-secondary);
}

/* 数据统计 */
.stats-row {
  display: flex;
  gap: 12px;
}

.stat-box {
  flex: 1;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px;
  text-align: center;
  transition: all 0.2s;
}

.stat-box:hover {
  border-color: var(--accent-color);
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent-color);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* 项目结构 */
.structure {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 14px 18px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-secondary);
  overflow-x: auto;
  white-space: pre;
  font-family: 'Consolas', 'Courier New', monospace;
}

/* 联系方式 */
.contact-info {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.contact-note {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
}

/* 响应式 */
@media (max-width: 768px) {
  .about-card {
    padding: 16px;
  }
  .tech-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .tech-list {
    grid-template-columns: 1fr;
  }
  .stats-row {
    flex-wrap: wrap;
  }
  .stat-box {
    min-width: 70px;
  }
}
</style>