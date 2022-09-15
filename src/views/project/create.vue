<template>
  <el-dialog
    title="Edit Project"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="visible"
  >
    <el-form ref="formData" :model="formData" :rules="formRules">
      <el-form-item label="Project Name" prop="name" :label-width="labelWidth">
        <el-input v-model="formData.name" style="width: 90%" />
      </el-form-item>
      <el-form-item label="Crontab" prop="cronExpr" :label-width="labelWidth">
        <el-input v-model="formData.cronExpr" style="width: 90%" />
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
    <el-table
      v-if="cronList && cronList.length > 0"
      :data="cronList"
      style="width: 90%; padding-left: 120px"
    >
      <el-table-column
        label="Execution Time"
        align="left"
      >
        <template slot-scope="{ row }">
          <span>{{ row }}</span>
        </template>
      </el-table-column>
    </el-table>
    <div slot="footer">
      <el-button @click="cancelForm()">Cancel</el-button>
      <el-button type="warning" @click="getCrontab()">CronTab</el-button>
      <el-button type="primary" @click="submitForm()">
        Confirm
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createFlow, updateFlow, parseCronExpr } from '@/api/job-flow.js'

export default {
  name: 'ProjectCreateDialog',
  data() {
    return {
      visible: false,
      labelWidth: '120px',
      cronList: [],
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
      const { id, name, cronExpr, description } = data
      this.formData = { id, name, cronExpr, description }
      this.originForm = { id, name, cronExpr, description }
    },

    getCrontab() {
      parseCronExpr({ 'cron': this.formData.cronExpr }).then((data) => {
        this.cronList = data
      })
    },

    submitForm() {
      if (this.formData.id) {
        this.update(this.formData.id)
      } else {
        this.create()
      }
    },

    update(id) {
      if (this.originForm.name !== this.formData.name ||
      this.originForm.description !== this.formData.description ||
      this.originForm.cronExpr !== this.formData.cronExpr) {
        updateFlow(this.formData).then(id => {
          this.visible = false
          this.$router.push(`/project/flow/edit/${id}`)
        })
      } else {
        this.visible = false
        this.$router.push(`/project/flow/edit/${id}`)
      }
    },

    create() {
      this.$refs.formData.validate((valid) => {
        if (!valid) {
          return false
        }
        createFlow(this.formData).then(id => {
          this.$router.push(`/project/flow/edit/${id}`)
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
