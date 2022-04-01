<template>
  <el-dialog title="Alert Configuration" :visible.sync="visible">
    <el-row :gutter="20">
      <el-col :span="22">
        <el-form :model="formData" :rules="formRules" label-width="120px">
          <el-form-item label="Alert" prop="alerts">
            <el-select v-model="formData.alerts" multiple style="width:100%">
              <el-option
                v-for="item in alertList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.description }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="text-align: right;">
            <el-button @click.stop="cancelForm">Cancel</el-button>
            <el-button type="primary" @click.stop="submitForm">Confirm</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { updateFlow } from '@/api/job-flow.js'
import { getAlertList } from '@/api/alert.js'

export default {
  name: 'EditAlertDialog',
  data() {
    return {
      visible: false,
      row: {},
      formData: {},
      alertList: [],
      formRules: {}
    }
  },

  methods: {
    init(data = {}) {
      this.resetForm()
      this.initAlertList()
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
