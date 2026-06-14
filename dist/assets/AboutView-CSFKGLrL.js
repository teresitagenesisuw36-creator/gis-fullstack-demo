import{_ as t,o as s,c as i,l as v}from"./index-BxfB0WaF.js";const d={class:"about-view"},e={__name:"AboutView",setup(l){return(n,a)=>(s(),i("div",d,[...a[0]||(a[0]=[v(`<div class="about-card" data-v-43f39787><h1 data-v-43f39787>GIS 应用前端框架</h1><p class="subtitle" data-v-43f39787>基于 Vite 6 + Vue 3.5 + Pinia + Vue Router</p><p class="version" data-v-43f39787>v1.0.0 | 2026-06-10</p><section class="about-section" data-v-43f39787><h2 data-v-43f39787>实验说明</h2><div class="exp-desc" data-v-43f39787><p data-v-43f39787><strong data-v-43f39787>实验名称：</strong>Web前端开发基础与GIS应用框架搭建</p><p data-v-43f39787><strong data-v-43f39787>实验目的：</strong>掌握现代前端工程化开发方法，构建GIS应用前端框架，实现界面设计、数据处理、状态管理和路由控制等核心功能。</p><p data-v-43f39787><strong data-v-43f39787>实验要求：</strong></p><ul class="tech-list" data-v-43f39787><li data-v-43f39787>使用Vue3组合式API进行组件开发</li><li data-v-43f39787>实现Pinia全局状态管理（含持久化）</li><li data-v-43f39787>集成Leaflet地图引擎与国产瓦片服务</li><li data-v-43f39787>支持空间数据渲染（点、线、面要素）</li><li data-v-43f39787>实现路由懒加载与导航守卫</li><li data-v-43f39787>支持浅色/深色主题切换</li><li data-v-43f39787>桌面端/移动端响应式适配</li></ul></div></section><section class="about-section" data-v-43f39787><h2 data-v-43f39787>技术栈</h2><div class="tech-grid" data-v-43f39787><div class="tech-item" data-v-43f39787><div class="tech-icon" data-v-43f39787>⚡</div><strong data-v-43f39787>Vite 6</strong><span data-v-43f39787>构建工具</span></div><div class="tech-item" data-v-43f39787><div class="tech-icon" data-v-43f39787>💚</div><strong data-v-43f39787>Vue 3.5</strong><span data-v-43f39787>UI 框架</span></div><div class="tech-item" data-v-43f39787><div class="tech-icon" data-v-43f39787>🍍</div><strong data-v-43f39787>Pinia</strong><span data-v-43f39787>状态管理</span></div><div class="tech-item" data-v-43f39787><div class="tech-icon" data-v-43f39787>🧭</div><strong data-v-43f39787>Vue Router 4</strong><span data-v-43f39787>路由控制</span></div><div class="tech-item" data-v-43f39787><div class="tech-icon" data-v-43f39787>🗺️</div><strong data-v-43f39787>Leaflet</strong><span data-v-43f39787>地图引擎</span></div><div class="tech-item" data-v-43f39787><div class="tech-icon" data-v-43f39787>🎨</div><strong data-v-43f39787>CSS3</strong><span data-v-43f39787>样式系统</span></div></div></section><section class="about-section" data-v-43f39787><h2 data-v-43f39787>功能特性</h2><ul class="tech-list feature-list" data-v-43f39787><li data-v-43f39787>浅色/深色主题切换（CSS 变量 + Pinia 持久化）</li><li data-v-43f39787>桌面端/移动端响应式适配（Flex / Grid 布局）</li><li data-v-43f39787>GIS 空间数据处理工具函数（距离计算、坐标格式化、面积统计）</li><li data-v-43f39787>GeoJSON 异步加载与处理模块</li><li data-v-43f39787>图层数据模型（ES6 Class 封装）</li><li data-v-43f39787>图层可见性控制、透明度调节、搜索过滤</li><li data-v-43f39787>实时鼠标经纬度显示</li><li data-v-43f39787>地图工具栏与状态联动（平移、缩放、测距、识别）</li><li data-v-43f39787>多底图切换（街道地图 / 卫星地图 / 混合地图）</li><li data-v-43f39787>分类 POI 图标系统（景点、教育、商业、交通、公园）</li><li data-v-43f39787>道路分级渲染（高速 / 环路 / 主干 / 次干）</li><li data-v-43f39787>行政区划面要素渲染（含人口、面积、密度数据）</li><li data-v-43f39787>Composables 逻辑复用（useLayers、useTheme）</li><li data-v-43f39787>Pinia 状态持久化（localStorage）</li><li data-v-43f39787>路由懒加载与权限控制（beforeEach 全局守卫）</li></ul></section><section class="about-section" data-v-43f39787><h2 data-v-43f39787>项目结构</h2><pre class="structure" data-v-43f39787>gis-app/
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
        </pre></section><section class="about-section" data-v-43f39787><h2 data-v-43f39787>数据概览</h2><div class="stats-row" data-v-43f39787><div class="stat-box" data-v-43f39787><div class="stat-num" data-v-43f39787>24</div><div class="stat-label" data-v-43f39787>POI 兴趣点</div></div><div class="stat-box" data-v-43f39787><div class="stat-num" data-v-43f39787>15</div><div class="stat-label" data-v-43f39787>道路线</div></div><div class="stat-box" data-v-43f39787><div class="stat-num" data-v-43f39787>6</div><div class="stat-label" data-v-43f39787>行政区划</div></div><div class="stat-box" data-v-43f39787><div class="stat-num" data-v-43f39787>3</div><div class="stat-label" data-v-43f39787>图层</div></div></div></section><section class="about-section" data-v-43f39787><h2 data-v-43f39787>联系方式</h2><div class="contact-info" data-v-43f39787><p data-v-43f39787>如有问题或建议，请联系课程教师或助教。</p><p class="contact-note" data-v-43f39787>本应用为实验课程演示项目，仅供学习参考。</p></div></section></div>`,1)])]))}},o=t(e,[["__scopeId","data-v-43f39787"]]);export{o as default};
