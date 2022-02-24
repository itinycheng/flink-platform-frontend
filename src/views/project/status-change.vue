<template>
  <el-dialog
    title="Modify Status"
    width="30%"
    :destroy-on-close="true"
    :visible.sync="visible"
  >
    <el-form ref="statusData" :model="statusData" :rules="formRules">
      <el-form-item label="Status" prop="status" :label-width="labelWidth">
        <el-select
          v-model="statusData.status"
          style="width:90%"
          placeholder="Status"
          class="filter-item"
        >
          <el-option
            v-for="item in listStatus"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="CronTab" prop="cronExpr" :label-width="labelWidth">
        <el-input v-model="statusData.cronExpr" style="width:90%" />
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
import { updateFlow } from '@/api/job-flow.js'
import { getStatusList } from '@/api/attr.js'

export default {
  name: 'StatusChangeDialog',
  data() {
    return {
      visible: false,
      labelWidth: '100px',
      listStatus: [],
      row: {},
      originForm: {},
      statusData: {},
      formRules: {
        status: [
          { required: true, message: 'Please choose status', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getStatus()
  },
  methods: {
    init(data = {}) {
      this.visible = true
      this.row = data
      const { id, status, cronExpr } = data
      this.statusData = { id, status, cronExpr }
      this.originForm = { id, status, cronExpr }
    },
    getStatus() {
      var data = { className: 'JobFlowStatus' }
      getStatusList(data).then((result) => {
        this.listStatus = result
      })
    },
    async submitForm() {
      if (this.originForm.status !== this.statusData.status ||
      this.originForm.cronExpr !== this.statusData.cronExpr) {
        await updateFlow(this.statusData)
        this.closeForm()
        this.$parent.getList()
      }
    },
    closeForm() {
      this.visible = false
      this.$refs.statusData.clearValidate()
      this.$refs.statusData.resetFields()
    }
  }
}
</script>
