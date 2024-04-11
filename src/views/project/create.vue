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
      <el-form-item label="Parallel Tasks" prop="parallelism" :label-width="labelWidth">
        <el-input v-model="formData.config.parallelism" type="number" min="1" style="width: 90%" />
      </el-form-item>
      <el-form-item label="Timeout" prop="timeout" :label-width="labelWidth">
        <el-switch v-model="formData.timeout.enable" style="width: 6%;" />
        <el-select
          v-model="formData.timeout.strategies"
          style="width: 40%;margin-left: 2%;"
          placeholder="timeout strategies"
          multiple
          clearable
        >
          <el-option
            v-for="item in timeoutStrategies"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
        <el-input v-model="formData.timeout.threshold" placeholder="Unit: s sec, m min, h hour, d day" style="width: 40%; margin-left: 2%;" />
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
      <el-button @click.stop="cancelForm()">Cancel</el-button>
      <el-button type="warning" @click.stop="getCrontab()">CronTab</el-button>
      <el-button type="success" @click.stop="enterJobFlow()">Edit Workflow</el-button>
      <el-button type="primary" @click.stop="submitForm()">Confirm</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createFlow, updateFlow, parseCronExpr } from '@/api/job-flow.js'
import { getStatusList } from '@/api/attr'

export default {
  name: 'ProjectCreateDialog',
  data() {
    return {
      visible: false,
      labelWidth: '120px',
      timeoutStrategies: [],
      cronList: [],
      formData: { timeout: { enable: false }, config: {}},
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
      this.getTimeoutStrategies()
      this.visible = true
      var { id, name, cronExpr, description, timeout, config } = data
      if (!timeout) {
        timeout = { enable: false }
      }
      if (!config) {
        config = {}
      }
      this.formData = { id, name, cronExpr, description, timeout, config }
    },

    getTimeoutStrategies() {
      var data = { className: 'TimeoutStrategy' }
      getStatusList(data).then((result) => {
        this.timeoutStrategies = result
      })
    },

    getCrontab() {
      parseCronExpr({ 'cron': this.formData.cronExpr }).then((data) => {
        this.cronList = data
      })
    },

    submitForm() {
      if (this.formData.id) {
        updateFlow(this.formData).then(id => {
          this.visible = false
          this.$emit('refreshList')
        })
      } else {
        this.$refs.formData.validate((valid) => {
          if (!valid) {
            return false
          }
          createFlow(this.formData).then(id => {
            this.visible = false
            this.$emit('refreshList')
          })
        })
      }
    },

    enterJobFlow() {
      const id = this.formData.id
      if (id) {
        this.visible = false
        this.$router.push(`/project/flow/edit/${id}`)
      }
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
        this.formData = { timeout: { enable: false }, config: {}}
      }
    }
  }
}
</script>
