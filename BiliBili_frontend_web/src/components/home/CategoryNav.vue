<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Compass } from '@element-plus/icons-vue'
import { loadCategoryTree } from '@/api/category'
import { resolveImage } from '@/utils/format'

const categories = ref([])
const loading = ref(true)

async function loadCategories() {
  loading.value = true
  try {
    categories.value = (await loadCategoryTree()) || []
  } catch {
    categories.value = []
  } finally {
    loading.value = false
  }
}

function handleCategory(category) {
  // 分区页暂未开发
  ElMessage.info(`「${category.categoryName}」分区页开发中`)
}

function handleQuick(label) {
  ElMessage.info(`${label}功能开发中`)
}

onMounted(loadCategories)
</script>

<template>
  <nav class="category-nav">
    <div class="category-nav__quick">
      <div class="category-nav__quick-item" @click="handleQuick('动态')">
        <span class="category-nav__quick-icon is-dynamic">
          <el-icon><Compass /></el-icon>
        </span>
        <span>动态</span>
      </div>
      <div class="category-nav__quick-item" @click="handleQuick('热门')">
        <span class="category-nav__quick-icon is-hot">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12.8 2.2c.3 3-1.3 4.7-2.8 6.3C8.6 10 7 11.6 7 14.4a5 5 0 0 0 10 0c0-1.4-.4-2.6-1.1-3.7-.2 1.2-.9 2.1-1.9 2.5.6-3.4-.5-7.4-1.2-11zM12 21a6.6 6.6 0 0 1-6.6-6.6c0-3.5 2-5.5 3.5-7.1C10.5 5.7 11.5 4.6 11 2a1 1 0 0 1 1.6-.9c2.7 2 4.6 5.1 4.8 8.2.8-.9 1.2-2 1.2-3.2a1 1 0 0 1 1.7-.7 11 11 0 0 1 2.3 9A8.3 8.3 0 0 1 12 21z"
            />
          </svg>
        </span>
        <span>热门</span>
      </div>
    </div>

    <div class="category-nav__list">
      <template v-if="loading">
        <span v-for="i in 12" :key="i" class="category-nav__item is-skeleton"></span>
      </template>

      <template v-else>
        <template v-for="category in categories" :key="category.categoryId">
          <el-popover
            v-if="category.children?.length"
            placement="bottom"
            trigger="hover"
            :show-arrow="false"
            :offset="6"
            :width="'auto'"
            popper-class="category-sub-popper"
          >
            <template #reference>
              <span class="category-nav__item" @click="handleCategory(category)">
                {{ category.categoryName }}
              </span>
            </template>
            <ul class="category-sub">
              <li
                v-for="child in category.children"
                :key="child.categoryId"
                class="category-sub__item"
                @click="handleCategory(child)"
              >
                <img
                  v-if="child.icon"
                  :src="resolveImage(child.icon)"
                  class="category-sub__icon"
                  alt=""
                />
                <span>{{ child.categoryName }}</span>
              </li>
            </ul>
          </el-popover>

          <span v-else class="category-nav__item" @click="handleCategory(category)">
            {{ category.categoryName }}
          </span>
        </template>

        <span v-if="!categories.length" class="category-nav__empty">暂无分类</span>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.category-nav {
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.category-nav__quick {
  display: flex;
  flex-shrink: 0;
  gap: 24px;
  padding-right: 24px;
  margin-right: 24px;
  border-right: 1px solid var(--line);
}

.category-nav__quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text1);
  cursor: pointer;
}

.category-nav__quick-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  color: #fff;
  font-size: 22px;
  transition: transform 0.2s;
}

.category-nav__quick-item:hover .category-nav__quick-icon {
  transform: scale(1.06);
}

.category-nav__quick-icon.is-dynamic {
  background: #ff9212;
}

.category-nav__quick-icon.is-hot {
  background: #f07775;
}

.category-nav__list {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 10px 12px;
}

.category-nav__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 8px;
  border-radius: 6px;
  background: var(--graph-bg);
  color: var(--text2);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.category-nav__item:hover {
  background: var(--line);
  color: var(--text1);
}

.category-nav__item.is-skeleton {
  cursor: default;
  animation: skeleton-pulse 1.2s ease-in-out infinite;
}

.category-nav__empty {
  color: var(--text3);
  line-height: 34px;
}

.category-sub {
  display: grid;
  grid-template-columns: repeat(2, minmax(96px, auto));
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.category-sub__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--text2);
  white-space: nowrap;
  cursor: pointer;
}

.category-sub__item:hover {
  background: var(--graph-bg);
  color: var(--bili-blue);
}

.category-sub__icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

@keyframes skeleton-pulse {
  50% {
    opacity: 0.5;
  }
}
</style>

<style>
.category-sub-popper.el-popover {
  min-width: 0;
  padding: 8px;
  border-radius: 8px;
}
</style>
