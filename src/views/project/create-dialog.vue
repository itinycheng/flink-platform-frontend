<template>
  <el-dialog
    title="Create Project"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="visible"
  >
    <el-form ref="formData" :model="formData" :rules="formRules">
      <el-form-item label="Project Name" prop="name" :label-width="labelWidth">
        <el-input v-model="formData.name" style="width: 90%" />
      </el-form-item>
      <el-form-item
        label="Description"
        prop="description"
        :label-width="labelWidth"
      >
        <el-input
          v-model="formData.description"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          style="width: 90%"
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="cancelForm()">Cancel</el-button>
      <el-button type="primary" @click="submitForm()">
        Confirm
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getFlow, updateFlow } from '@/api/job-flow.js'

export default {
  name: 'ProjectCreateDialog',
  data() {
    return {
      visible: false,
      labelWidth: '120px',
      originForm: {},
      formData: {},
      formRules: {
        name: [
          { required: true, message: 'Please enter name', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init(data = {}) {
      this.resetForm()
      this.visible = true
      const { id, name, description } = data
      this.formData = { id, name, description }
      this.originForm = { id, name, description }
    },

    submitForm() {
      if (this.formData.id) {
        this.update(this.formData.id)
      } else {
        this.create()
      }
    },

    async update(id) {
      if (this.originForm.name !== this.formData.name ||
      this.originForm.description !== this.formData.description) {
        await updateFlow(this.formData)
      }

      this.visible = false
      getFlow(id).then(
        res => {
          this.$router.push({
            path: '/project/update/' + res.id,
            query: { flow: res.flow }
          })
        }
      )
    },

    create() {
      this.$refs.formData.validate((valid) => {
        if (!valid) {
          return false
        }
        this.$http.post('/jobFlow/create', this.formData).then(res => {
          if (res.data.code === 0) {
            this.$router.push('/project/create/' + res.data.data)
          }
        })
      })
    },

    cancelForm() {
      this.visible = false
      this.resetForm()
    },

    resetForm() {
      if (this.$refs.formData) {
        this.$refs.formData.clearValidate()
        this.$refs.formData.resetFields()
      } else {
        this.formData = {}
      }
    }
  }
}
</script>
