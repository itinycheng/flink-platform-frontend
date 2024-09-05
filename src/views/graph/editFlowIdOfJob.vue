<template>
  <el-dialog title="Select JobFlow" :visible.sync="visible" width="30%">
    <el-form :model="formData">
      <el-form-item>
        <el-select v-model="formData.flowId" style="width:100%">
          <el-option
            v-for="item in list"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <span style="float: left">{{ item.name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="text-align: right;">
        <el-button @click.stop="cancelForm()">Cancel</el-button>
        <el-button type="primary" @click.stop="submitForm()">Confirm</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { updateJob } from '@/api/job'
import { getFlowIdNameList } from '@/api/job-flow'

export default {
  name: 'EditFlowIdOfJob',
  data() {
    return {
      visible: false,
      row: {},
      formData: {},
      list: []
    }
  },

  methods: {
    init(data = {}) {
      this.row = data
      const { id, flowId } = data
      this.formData = { id, flowId }
      getFlowIdNameList().then((result) => {
        this.list = result
        this.visible = true
      })
    },

    submitForm() {
      updateJob(this.formData).then(res => {
        this.cancelForm()
        this.$emit('getList')
      })
    },

    cancelForm() {
      this.visible = false
      this.resetForm()
    },

    resetForm() {
      this.formData = {}
    }
  }
}
</script>
