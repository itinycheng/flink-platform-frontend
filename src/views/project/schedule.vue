<template>
  <el-dialog
    title="Scheduling"
    width="30%"
    :destroy-on-close="true"
    :visible.sync="visible"
  >
    <el-form :disabled="true">
      <el-form-item label="CronTab" prop="cronExpr" :label-width="labelWidth">
        <el-input v-model="row.cronExpr" style="width:90%" />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="closeForm()">Cancel</el-button>
      <el-button type="warning" @click.stop="getCrontab()">CronTab</el-button>
      <el-button type="primary" @click="submitForm()">
        Confirm
      </el-button>
      <el-table
        v-if="cronList && cronList.length > 0"
        :data="cronList"
      >
        <el-table-column
          label="Execution Time"
          align="left"
        >
          <template slot-scope="{ row: tableRow }">
            <span>{{ tableRow }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script>
import { startSchedFlow } from '@/api/job-flow.js'
import { getStatusList } from '@/api/attr.js'
import { parseCronExpr } from '@/api/job-flow.js'

export default {
  name: 'ScheduleDialog',
  data() {
    return {
      visible: false,
      labelWidth: '100px',
      listStatus: [],
      row: {},
      cronList: []
    }
  },
  created() {
    this.getStatus()
  },
  methods: {
    init(data = {}) {
      this.row = data
      this.cronList = []
      this.visible = true
    },
    getStatus() {
      var data = { className: 'JobFlowStatus' }
      getStatusList(data).then((result) => {
        this.listStatus = result
      })
    },
    getCrontab() {
      parseCronExpr({ 'cron': this.row.cronExpr }).then((data) => {
        this.cronList = data
      })
    },
    async submitForm() {
      await startSchedFlow(this.row.id).then(result => {
        this.$message.success(`Scheduled Successfully, id=${result}`)
        this.closeForm()
        this.$emit('refreshList')
      })
    },
    closeForm() {
      this.visible = false
    }
  }
}
</script>
