<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { saveCategory } from '@/api/category'
import { uploadImage } from '@/api/upload'

const props = defineProps({
  mode: {
    type: String, // 'add-root' | 'add-child' | 'edit'
    required: true,
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['success'])

const visible = defineModel('visible', { default: false })

const formRef = ref(null)
const loading = ref(false)
const iconUploading = ref(false)
const backgroundUploading = ref(false)

const form = reactive({
  categoryName: '',
  categoryCode: '',
  icon: '',
  background: '',
})

const rules = {
  categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  categoryCode: [{ required: true, message: '请输入分类编码', trigger: 'blur' }],
}

const titleMap = {
  'add-root': '新增一级分类',
  'add-child': '新增子分类',
  edit: '编辑分类',
}
const title = computed(() => titleMap[props.mode] || '分类')

watch(visible, (val) => {
  if (!val) return

  // 新增场景（一级/子分类）不带入父分类自身的信息，表单从空白开始
  if (props.mode === 'edit') {
    form.categoryName = props.initialData?.categoryName || ''
    form.categoryCode = props.initialData?.categoryCode || ''
    form.icon = props.initialData?.icon || ''
    form.background = props.initialData?.background || ''
  } else {
    form.categoryName = ''
    form.categoryCode = ''
    form.icon = ''
    form.background = ''
  }

  formRef.value?.clearValidate()
})

function beforeImageUpload(file) {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('只能上传图片文件')
    return false
  }
  if (file.size / 1024 / 1024 >= 50) {
    ElMessage.warning('图片大小不能超过 50MB')
    return false
  }
  return true
}

async function handleIconUpload({ file }) {
  iconUploading.value = true
  try {
    form.icon = await uploadImage(file)
  } finally {
    iconUploading.value = false
  }
}

async function handleBackgroundUpload({ file }) {
  backgroundUploading.value = true
  try {
    form.background = await uploadImage(file)
  } finally {
    backgroundUploading.value = false
  }
}

function resolvePCategoryId() {
  if (props.mode === 'add-root') return 0
  if (props.mode === 'add-child') return props.initialData?.categoryId
  return props.initialData?.pCategoryId
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const payload = {
    categoryName: form.categoryName,
    categoryCode: form.categoryCode,
    icon: form.icon,
    background: form.background,
    pCategoryId: resolvePCategoryId(),
  }
  if (props.mode === 'edit') {
    payload.categoryId = props.initialData?.categoryId
  }

  loading.value = true
  try {
    await saveCategory(payload)
    ElMessage.success('保存成功')
    visible.value = false
    emit('success')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="480px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="分类名称" prop="categoryName">
        <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="分类编码" prop="categoryCode">
        <el-input v-model="form.categoryCode" placeholder="请输入分类编码" />
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <div class="image-uploader" v-loading="iconUploading">
          <el-upload
            accept="image/*"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :http-request="handleIconUpload"
          >
            <img v-if="form.icon" :src="form.icon" class="image-uploader__preview" />
            <el-icon v-else class="image-uploader__placeholder"><Plus /></el-icon>
          </el-upload>
          <el-button v-if="form.icon" link type="danger" size="small" @click="form.icon = ''">
            清除
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="背景" prop="background">
        <div class="image-uploader" v-loading="backgroundUploading">
          <el-upload
            accept="image/*"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :http-request="handleBackgroundUpload"
          >
            <img v-if="form.background" :src="form.background" class="image-uploader__preview" />
            <el-icon v-else class="image-uploader__placeholder"><Plus /></el-icon>
          </el-upload>
          <el-button
            v-if="form.background"
            link
            type="danger"
            size="small"
            @click="form.background = ''"
          >
            清除
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.image-uploader {
  display: flex;
  align-items: center;
  gap: 8px;
}

.image-uploader :deep(.el-upload) {
  width: 72px;
  height: 72px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
}

.image-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.image-uploader__preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-uploader__placeholder {
  font-size: 20px;
  color: var(--el-text-color-placeholder);
}
</style>
