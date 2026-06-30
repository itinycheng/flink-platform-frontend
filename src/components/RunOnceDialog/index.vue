<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visible"
    width="420px"
    append-to-body
    @close="handleClose"
  >
    <el-date-picker
      v-model="scheduleTime"
      type="datetime"
      value-format="yyyy-MM-dd HH:mm:ss"
      placeholder="Schedule time (optional, default to Now)"
      style="width: 100%;"
    />
    <div class="run-once-tip">
      Runs immediately. Leave the time empty to compute biz* time variables
      (e.g. ${time:yyyyMMdd[bizDay]}) from the current time, or pick a time to
      compute them from it — useful for backfilling past data.
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="handleRun">Run</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'RunOnceDialog',
  data() {
    return {
      visible: false,
      scheduleTime: null,
      flowName: '',
      onConfirm: null
    }
  },
  computed: {
    dialogTitle() {
      return this.flowName ? `Run Once - ${this.flowName}` : 'Run Once'
    }
  },
  methods: {
    open(onConfirm, flowName) {
      this.scheduleTime = null
      this.flowName = flowName || ''
      this.onConfirm = onConfirm
      this.visible = true
    },
    handleRun() {
      const cb = this.onConfirm
      const scheduleTime = this.scheduleTime || null
      this.visible = false
      if (cb) {
        cb(scheduleTime)
      }
    },
    handleClose() {
      this.scheduleTime = null
    }
  }
}
</script>

<style scoped>
.run-once-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
