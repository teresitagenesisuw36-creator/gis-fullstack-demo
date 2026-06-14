<template>
  <!-- 顶栏：语义化 header 标签 -->
  <header class="topbar">
    <div class="topbar-left">
      <h1 class="app-title">GIS 应用框架</h1>
    </div>

    <!-- 导航菜单：使用 Vue Router -->
    <nav class="topbar-nav">
      <router-link to="/" class="nav-item" active-class="nav-active">
        <span class="nav-icon">&#127760;</span>
        <span>地图</span>
      </router-link>
      <router-link to="/data" class="nav-item" active-class="nav-active">
        <span class="nav-icon">&#128202;</span>
        <span>数据</span>
      </router-link>
      <router-link to="/about" class="nav-item" active-class="nav-active">
        <span class="nav-icon">&#8505;&#65039;</span>
        <span>关于</span>
      </router-link>
      <router-link to="/portfolio" class="nav-item" active-class="nav-active">
        <span class="nav-icon">&#127912;</span>
        <span>作品集</span>
      </router-link>
    </nav>

    <!-- 主题切换 -->
    <div class="topbar-right">
      <button class="theme-toggle" @click="toggle" :title="isDark ? '切换浅色主题' : '切换深色主题'">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { useTheme } from '@/composables/useLayers.js'

const { isDark, toggle } = useTheme()
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  z-index: 100;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-color);
  white-space: nowrap;
}

/* 导航菜单 */
.topbar-nav {
  display: flex;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 14px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: var(--hover-bg);
  color: var(--accent-color);
}

.nav-active {
  background: var(--accent-color);
  color: #fff;
}

.nav-active:hover {
  background: var(--accent-hover);
  color: #fff;
}

.nav-icon {
  font-size: 16px;
}

.topbar-right {
  display: flex;
  align-items: center;
}

.theme-toggle {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: var(--hover-bg);
  transform: scale(1.1);
}

/* 响应式：移动端 */
@media (max-width: 768px) {
  .app-title {
    font-size: 14px;
  }
  .nav-item {
    padding: 4px 8px;
  }
  .nav-item span:last-child {
    display: none;
  }
}
</style>