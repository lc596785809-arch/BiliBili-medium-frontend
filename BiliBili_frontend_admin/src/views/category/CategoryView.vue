<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { loadCategoryTree, delCategory, updateSort } from '@/api/category'
import CategoryDialog from './components/CategoryDialog.vue'

const treeRef = ref(null)
const treeData = ref([])
const loading = ref(false)

const treeProps = {
  label: 'categoryName',
  children: 'children',
}

const dialogVisible = ref(false)
const dialogMode = ref('add-root')
const dialogInitialData = ref({})

async function loadTree() {
  loading.value = true
  try {
    treeData.value = (await loadCategoryTree()) || []
  } finally {
    loading.value = false
  }
}

function isImageUrl(val) {
  return typeof val === 'string' && (/^https?:\/\//.test(val) || val.startsWith('/'))
}

function getParentCategoryId(node) {
  return node.parent?.data?.categoryId ?? 0
}

function openAddRoot() {
  dialogMode.value = 'add-root'
  dialogInitialData.value = {}
  dialogVisible.value = true
}

function openAddChild(node, data) {
  dialogMode.value = 'add-child'
  dialogInitialData.value = { categoryId: data.categoryId }
  dialogVisible.value = true
}

function openEdit(node, data) {
  dialogMode.value = 'edit'
  dialogInitialData.value = { ...data, pCategoryId: getParentCategoryId(node) }
  dialogVisible.value = true
}

async function handleDelete(data) {
  try {
    await delCategory(data.categoryId)
    ElMessage.success('删除成功')
    loadTree()
  } catch {
    // 拦截器已弹出错误提示（含 606 存在子分类的情况）
  }
}

function handleAllowDrop(draggingNode, dropNode) {
  // 允许在同级节点的整行范围内放置（含中间的 "inner" 区域），避免行中间出现拖拽死区；
  // 落到具体哪个位置（目标行前 / 后）在 node-drop 里统一处理，不区分 before/after/inner
  return draggingNode.parent === dropNode.parent
}

async function handleNodeDrop(draggingNode, dropNode, dropType) {
  // 注意：el-tree 在触发 node-drop 前已经把 draggingNode 从树上移除，
  // 此时 draggingNode.parent 已被置空，不能再用它取兄弟节点；
  // dropNode 本身不会被移除，用 dropNode.parent 才是可靠的兄弟节点来源。
  const draggingId = draggingNode.data.categoryId
  const siblingIds = dropNode.parent.childNodes
    .map((node) => node.data.categoryId)
    .filter((categoryId) => categoryId !== draggingId)

  const dropIndex = siblingIds.indexOf(dropNode.data.categoryId)
  const insertAt = dropType === 'before' ? dropIndex : dropIndex + 1
  siblingIds.splice(insertAt, 0, draggingId)

  const sortList = siblingIds.map((categoryId, index) => ({
    categoryId,
    sort: index + 1,
  }))

  try {
    await updateSort(sortList)
    ElMessage.success('排序已更新')
  } finally {
    loadTree()
  }
}

onMounted(() => {
  loadTree()
})
</script>

<template>
  <div class="category-page">
    <div class="category-page__toolbar">
      <el-button type="primary" @click="openAddRoot">新增一级分类</el-button>
    </div>

    <el-card v-loading="loading">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        node-key="categoryId"
        draggable
        default-expand-all
        :allow-drop="handleAllowDrop"
        @node-drop="handleNodeDrop"
      >
        <template #default="{ node, data }">
          <div class="category-node">
            <span class="category-node__name">{{ data.categoryName }}</span>
            <el-tag size="small" type="info">{{ data.categoryCode }}</el-tag>

            <img
              v-if="isImageUrl(data.icon)"
              :src="data.icon"
              class="category-node__icon"
              alt="icon"
            />

            <span class="category-node__sort">排序：{{ data.sort }}</span>

            <span class="category-node__ops">
              <el-button link type="primary" size="small" @click.stop="openAddChild(node, data)">
                新增子分类
              </el-button>
              <el-button link type="primary" size="small" @click.stop="openEdit(node, data)">
                编辑
              </el-button>
              <el-popconfirm
                title="确认删除该分类吗？"
                @confirm="handleDelete(data)"
              >
                <template #reference>
                  <el-button link type="danger" size="small" @click.stop>删除</el-button>
                </template>
              </el-popconfirm>
            </span>
          </div>
        </template>
      </el-tree>
    </el-card>

    <CategoryDialog
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :initial-data="dialogInitialData"
      @success="loadTree"
    />
  </div>
</template>

<style scoped>
.category-page__toolbar {
  margin-bottom: 16px;
}

.category-node {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding-right: 12px;
}

.category-node__name {
  font-weight: 500;
}

.category-node__icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: cover;
}

.category-node__sort {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.category-node__ops {
  margin-left: auto;
  display: flex;
  gap: 4px;
}
</style>
