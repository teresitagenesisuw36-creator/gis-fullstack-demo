<template>
  <!--
    图层搜索过滤组件
    输入关键词，触发搜索事件给父组件
  -->
  <div class="layer-search">
    <input
      ref="inputRef"
      v-model="keyword"
      type="search"
      placeholder="搜索图层..."
      @input="doSearch"
      @keydown.escape="clear"
    >
    <button v-if="keyword" class="clear-btn" @click="clear" title="清除">
      &times;
    </button>
    <span class="search-icon">🔍</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search'])

const keyword = ref('')
const inputRef = ref(null)

const doSearch = () => {
  emit('search', keyword.value)
}

const clear = () => {
  keyword.value = ''
  emit('search', '')
  if (inputRef.value) {
    inputRef.value.focus()
  }
}
</script>

<style scoped>
.layer-search {
  position: relative;
  margin-bottom: 8px;
  display: flex;
}

.layer-search input {
  flex: 1;
  padding: 8px 32px 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 13px;
  transition: border-color 0.3s ease;
  outline: none;
}

.layer-search input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px var(--hover-bg);
}

.clear-btn {
  position: absolute;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: var(--hover-bg);
  color: var(--accent-color);
}

.search-icon {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  opacity: 0.5;
  pointer-events: none;
}
</style>