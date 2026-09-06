<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  loadVideoList,
  recommendVideo,
  setVideoPublic,
  setVideoVip,
  deleteVideo,
  buildDownloadUrl,
} from '@/api/video'
import { loadLeafCategories } from '@/api/category'
import AuditDialog from './components/AuditDialog.vue'
import VideoDetailDialog from './components/VideoDetailDialog.vue'

const AUDIT_STATUS_MAP = {
  0: { label: '草稿', type: 'info' },
  1: { label: '待审核', type: 'warning' },
  2: { label: '审核通过', type: 'success' },
  3: { label: '驳回', type: 'danger' },
}

const loading = ref(false)
// 后端 loadVideoList 没有注册 MyBatis-Plus 的分页拦截器，pageNo/pageSize 对查询不生效、
// total 恒为 0 —— 这里改成前端对返回的全量结果自己做分页，规避这个后端缺陷
const allRecords = ref([])
const total = computed(() => allRecords.value.length)
const tableData = computed(() => {
  const start = (queryForm.pageNo - 1) * queryForm.pageSize
  return allRecords.value.slice(start, start + queryForm.pageSize)
})

const leafCategories = ref([])
const categoryMap = computed(() =>
  Object.fromEntries(leafCategories.value.map((c) => [c.categoryId, c.categoryName])),
)

const queryForm = reactive({
  videoName: '',
  categoryId: undefined,
  recommendType: undefined,
  isVip: undefined,
  pageNo: 1,
  pageSize: 20,
})

const auditVisible = ref(false)
const auditVideoId = ref('')

const detailVisible = ref(false)
const detailVideoId = ref('')

function auditStatusInfo(status) {
  return AUDIT_STATUS_MAP[status] || { label: '未知', type: 'info' }
}

function formatDate(value) {
  if (!value) return ''
  return String(value).replace('T', ' ').slice(0, 19)
}

async function loadLeafCategoryOptions() {
  leafCategories.value = (await loadLeafCategories()) || []
}

async function loadList() {
  loading.value = true
  try {
    const data = await loadVideoList(queryForm)
    allRecords.value = data?.records || []
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNo = 1
  loadList()
}

function handleReset() {
  queryForm.videoName = ''
  queryForm.categoryId = undefined
  queryForm.recommendType = undefined
  queryForm.isVip = undefined
  queryForm.pageNo = 1
  loadList()
}

function handlePageChange(pageNo) {
  // 全量数据已经在前端缓存，翻页只是重新切片，不需要再次请求接口
  queryForm.pageNo = pageNo
}

async function handleRecommendChange(row, value) {
  try {
    await recommendVideo(row.videoId, value)
    ElMessage.success('推荐状态已更新')
  } finally {
    loadList()
  }
}

async function handleVipChange(row, value) {
  try {
    await setVideoVip(row.videoId, value)
    ElMessage.success('VIP 状态已更新')
  } finally {
    loadList()
  }
}

async function handlePublicChange(row, value) {
  try {
    await setVideoPublic(row.videoId, value)
    ElMessage.success('公开状态已更新')
  } finally {
    loadList()
  }
}

async function handleDelete(row) {
  try {
    await deleteVideo(row.videoId)
    ElMessage.success('删除成功')
    loadList()
  } catch {
    // 拦截器已弹出错误提示
  }
}

function handleDownload(row) {
  window.open(buildDownloadUrl(row.videoId), '_blank')
}

function openAudit(row) {
  auditVideoId.value = row.videoId
  auditVisible.value = true
}

function openDetail(row) {
  detailVideoId.value = row.videoId
  detailVisible.value = true
}

onMounted(() => {
  loadLeafCategoryOptions()
  loadList()
})
</script>

<template>
  <div class="video-page">
    <el-card class="video-page__filter">
      <el-form inline :model="queryForm" @submit.prevent>
        <el-form-item label="视频名称">
          <el-input
            v-model="queryForm.videoName"
            placeholder="请输入视频名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="视频分类">
          <el-select v-model="queryForm.categoryId" placeholder="全部分类" clearable style="width: 160px">
            <el-option
              v-for="item in leafCategories"
              :key="item.categoryId"
              :label="item.categoryName"
              :value="item.categoryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="推荐状态">
          <el-select v-model="queryForm.recommendType" placeholder="全部" clearable style="width: 120px">
            <el-option label="已推荐" :value="1" />
            <el-option label="未推荐" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="VIP内容">
          <el-select v-model="queryForm.isVip" placeholder="全部" clearable style="width: 120px">
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" class="video-page__table">
      <el-table :data="tableData" row-key="videoId">
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <img v-if="row.videoCover" :src="row.videoCover" class="video-page__cover" alt="封面" />
          </template>
        </el-table-column>
        <el-table-column prop="videoName" label="视频名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="nickName" label="上传用户" width="120" />
        <el-table-column prop="playCount" label="播放量" width="100" />
        <el-table-column prop="introduction" label="简介" min-width="180" show-overflow-tooltip />
        <el-table-column label="最后编辑时间" width="160">
          <template #default="{ row }">{{ formatDate(row.lastUpdateTime) }}</template>
        </el-table-column>
        <el-table-column label="审核" width="70">
          <template #default="{ row }">
            <el-button v-if="row.auditStatus === 1" link type="primary" size="small" @click="openAudit(row)">
              审核
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="auditStatusInfo(row.auditStatus).type">
              {{ auditStatusInfo(row.auditStatus).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="推荐" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.recommendType"
              :active-value="1"
              :inactive-value="0"
              :disabled="row.auditStatus !== 2"
              @change="(val) => handleRecommendChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="VIP" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.isVip"
              :active-value="1"
              :inactive-value="0"
              :disabled="row.auditStatus !== 2"
              @change="(val) => handleVipChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="公开" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.isPublic"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handlePublicChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
            <el-button
              v-if="row.auditStatus !== 0"
              link
              type="primary"
              size="small"
              @click="handleDownload(row)"
            >
              下载
            </el-button>
            <el-popconfirm title="确认删除该视频吗？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="video-page__pagination"
        layout="total, prev, pager, next, jumper"
        :total="total"
        :page-size="queryForm.pageSize"
        :current-page="queryForm.pageNo"
        @current-change="handlePageChange"
      />
    </el-card>

    <AuditDialog v-model:visible="auditVisible" :video-id="auditVideoId" @success="loadList" />
    <VideoDetailDialog
      v-model:visible="detailVisible"
      :video-id="detailVideoId"
      :category-map="categoryMap"
    />
  </div>
</template>

<style scoped>
.video-page__filter {
  margin-bottom: 16px;
}

.video-page__cover {
  width: 96px;
  height: 54px;
  object-fit: cover;
  border-radius: 4px;
}

.video-page__pagination {
  margin-top: 16px;
  justify-content: flex-end;
  display: flex;
}
</style>
