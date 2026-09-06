<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { auditVideo } from '@/api/video'

const props = defineProps({
  videoId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['success'])

const visible = defineModel('visible', { default: false })

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  auditStatus: 2,
  rejectReason: '',
})

const rules = {
  rejectReason: [
    {
      validator: (rule, value, callback) => {
        if (form.auditStatus === 3 && !value) {
          callback(new Error('请填写驳回原因'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

watch(visible, (val) => {
  if (!val) return
  form.auditStatus = 2
  form.rejectReason = ''
  formRef.value?.clearValidate()
})

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await auditVideo({
      videoId: props.videoId,
      auditStatus: form.auditStatus,
      rejectReason: form.auditStatus === 3 ? form.rejectReason : undefined,
    })
    ElMessage.success('审核提交成功')
    visible.value = false
    emit('success')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-dialog v-model="visible" title="视频审核" width="480px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="审核结果">
        <el-radio-group v-model="form.auditStatus">
          <el-radio :value="2">审核通过</el-radio>
          <el-radio :value="3">驳回</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.auditStatus === 3" label="驳回原因" prop="rejectReason">
        <el-input
          v-model="form.rejectReason"
          type="textarea"
          :rows="3"
          placeholder="请填写驳回原因"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
