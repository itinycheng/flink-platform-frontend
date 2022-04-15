<template>
  <el-dialog title="Alert Configuration" :visible.sync="visible">
    <el-form :model="formData" :rules="formRules">
      <template v-for="(rowItem, index) in formData.alerts">
        <el-row :key="'r' + index" :gutter="20">
          <el-col :span="10">
            <el-form-item :label="'Alert' + index" :prop="'alerts.' + index + '.alertId'" label-width="100px">
              <el-select v-model="rowItem.alertId" style="width:100%">
                <el-option
                  v-for="alert in alertList"
                  :key="alert.id"
                  :label="alert.name"
                  :value="alert.id"
                >
                  <span style="float: left">{{ alert.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item :prop="'alerts.' + index + '.statuses'">
              <el-select v-model="rowItem.statuses" multiple style="width:100%">
                <el-option
                  v-for="status in statusList"
                  :key="status.name"
                  :label="status.name"
                  :value="status.name"
                >
                  <span style="float: left">{{ status.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="1">
            <el-button type="danger" icon="el-icon-delete" circle @click.prevent="deleteAlert(rowItem)" />
          </el-col>
        </el-row>
      </template>
      <el-row :gutter="20">
        <el-col :span="22">
          <el-form-item style="text-align: right;">
            <el-button @click.stop="cancelForm">Cancel</el-button>
            <el-button type="success" @click.stop="addAlert">Add One</el-button>
            <el-button type="primary" @click.stop="submitForm">Confirm</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script>
import { updateFlow } from '@/api/job-flow.js'
import { getAlertList } from '@/api/alert.js'
import { getStatusList } from '@/api/attr'

export default {
  name: 'EditAlertDialog',
  data() {
    return {
      visible: false,
      row: {},
      formData: {},
      alertList: [],
      statusList: [],
      formRules: {}
    }
  },

  methods: {
    init(data = {}) {
      this.resetForm()
      this.initAlertList()
      this.initStatusList()
      this.row = data
      const { id, alerts } = data
      this.formData = { id, alerts }
      this.visible = true
    },

    initAlertList() {
      getAlertList().then(res => {
        this.alertList = res
      })
    },

    initStatusList() {
      var data = { className: 'ExecutionStatus' }
      getStatusList(data).then((result) => {
        this.statusList = result
      })
    },

    addAlert() {
      if (!this.formData.alerts) {
        this.formData.alerts = []
      }
      this.formData.alerts.push({
        alertId: null,
        statuses: []
      })
    },

    deleteAlert(item) {
      var index = this.formData.alerts.indexOf(item)
      if (index !== -1) {
        this.formData.alerts.splice(index, 1)
      }
    },

    submitForm() {
      updateFlow(this.formData).then(res => {
        this.row.alerts = this.formData.alerts
        this.cancelForm()
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
