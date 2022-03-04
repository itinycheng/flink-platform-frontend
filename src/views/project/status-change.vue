<template>
  <el-dialog
    title="Modify Status"
    width="30%"
    :destroy-on-close="true"
    :visible.sync="visible"
  >
    <el-form ref="statusData" :model="statusData" :disabled="true">
      <el-form-item label="CronTab" prop="cronExpr" :label-width="labelWidth">
        <el-input v-model="row.cronExpr" style="width:90%" />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="closeForm()">Cancel</el-button>
      <el-button type="primary" @click="submitForm()">
        Confirm
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { startSchedFlow } from '@/api/job-flow.js'
import { getStatusList } from '@/api/attr.js'

export default {
  name: 'StatusChangeDialog',
  data() {
    return {
      visible: false,
      labelWidth: '100px',
      listStatus: [],
      row: {}
    }
  },
  created() {
    this.getStatus()
  },
  methods: {
    init(data = {}) {
      this.visible = true
      this.row = data
    },
    getStatus() {
      var data = { className: 'JobFlowStatus' }
      getStatusList(data).then((result) => {
        this.listStatus = result
      })
    },
    async submitForm() {
      await startSchedFlow(this.row.id).then(result => {
        this.$notify({
          title: 'Success',
          message: 'Start Successfully, id=' + result,
          type: 'success'
        })
        this.closeForm()
        this.$parent.getList()
      })
    },
    closeForm() {
      this.visible = false
      this.$refs.statusData.resetFields()
    }
  }
}
</script>
