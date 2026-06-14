<template>
  <!-- 使用语义化标签 -->
  <div class="app-layout">
    <!-- 顶栏 -->
    <TopBar />

    <div class="main-area">
      <!-- 侧边栏 -->
      <SideBar class="sidebar" />

      <!-- 地图主区域：路由视图 -->
      <main class="map-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- 状态栏 -->
    <StatusBar />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMapStore } from '@/stores/mapStore.js'
import TopBar from '@/components/TopBar.vue'
import SideBar from '@/components/SideBar.vue'
import StatusBar from '@/components/StatusBar.vue'

const mapStore = useMapStore()

onMounted(() => {
  // 初始化并修正持久化数据（主题、图层可见性等）
  mapStore.bootstrap()
})
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-area {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  /* 侧边栏宽度由组件内部控制 */
}

.map-main {
  flex: 1;
  overflow: hidden;
  position: relative;
}
</style>