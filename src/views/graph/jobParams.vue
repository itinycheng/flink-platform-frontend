<template>
  <el-dialog title="Edit Parameter" :visible.sync="visible">

    <el-table
      :data="tableData"
      style="width: 100%; margin-bottom: 10px;"
      max-height="350"
    >
      <el-table-column
        fixed
        prop="paramName"
        label="ParamName"
        width="150"
      />
      <el-table-column
        prop="paramValue"
        label="ParamValue"
        width="120"
      />
      <el-table-column
        prop="type"
        label="Type"
        width="100"
      />
      <el-table-column
        prop="status"
        label="Status"
        width="100"
      />
      <el-table-column
        prop="createTime"
        label="CreateTime"
        width="150"
      />
      <el-table-column
        prop="updateTime"
        label="UpdateTime"
        width="150"
      />
      <el-table-column
        fixed="right"
        label="Operations"
        width="100"
      >
        <template slot-scope="scope">
          <el-button type="text" size="small" :disabled="disabled" @click="showEditParam(scope.$index, tableData)">Edit</el-button>
          <el-button type="text" size="small" :disabled="disabled" @click="deleteRow(scope.$index, tableData)">Disable</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-form :inline="true" :model="formData" :disabled="disabled" :rules="formRules">
      <el-form-item label="Name">
        <el-input v-model="formData.paramName" placeholder="param name" />
      </el-form-item>
      <el-form-item label="Value">
        <el-input v-model="formData.paramValue" placeholder="param value" />
      </el-form-item>
      <el-form-item label="Status">
        <el-select v-model="formData.status" placeholder="status">
          <el-option
            v-for="item in statusList"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain @click="addParam">Add</el-button>
        <el-button type="primary" plain @click="updateParam">Update</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { updateParam, createParam, getParamList } from '@/api/job-param.js'
import { getStatusList } from '@/api/attr'

export default {
  name: 'EditParamDialog',
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      flowId: null,
      statusList: [],
      formData: {},
      tableData: [],
      formRules: {}
    }
  },

  methods: {
    init(data = {}) {
      if (data.type === 'instance') {
        return
      }

      this.flowId = data.id
      this.resetForm()
      this.initStatusList()
      this.refreshParamList()
      this.visible = true
    },

    initStatusList() {
      var data = { className: 'Status' }
      getStatusList(data).then((result) => {
        this.statusList = result
      })
    },

    refreshParamList() {
      var data = { flowId: this.flowId }
      getParamList(data).then(res => {
        this.tableData = res
      })
    },

    addParam() {
      createParam({
        flowId: this.flowId,
        type: 'JOB_FLOW',
        ...this.formData
      }).then(res => {
        this.formData = {}
        this.refreshParamList()
      })
    },

    updateParam() {
      if (!this.formData.id) {
        this.$message({
          message: 'Flow Id not found',
          type: 'error'
        })
        return
      }
      updateParam({
        flowId: this.flowId,
        ...this.formData
      }).then(res => {
        this.formData = {}
        this.refreshParamList()
      })
    },

    showEditParam(index, rows) {
      var row = rows[index]
      this.formData = {
        id: row.id,
        paramName: row.paramName,
        paramValue: row.paramValue,
        status: row.status
      }
    },

    deleteRow(index, rows) {
      var row = rows[index]
      updateParam({ id: row.id, status: 'DELETED' })
        .then(result => {
          this.$message({
            message: 'Delete successfully, id=' + result,
            type: 'success'
          })
          // rows.splice(index, 1)
          this.refreshParamList()
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
