<template>
  <!-- 地图页面视图 -->
  <div class="map-view">
    <MapArea />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMapStore } from '@/stores/mapStore.js'
import MapArea from '@/components/MapArea.vue'

const mapStore = useMapStore()

// 生命周期钩子：组件挂载后执行初始化
onMounted(() => {
  mapStore.hydrateLayers()
})
</script>

<style scoped>
.map-view {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>