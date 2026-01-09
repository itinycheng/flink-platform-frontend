<template>
  <el-dialog title="Edit Parameter" :visible.sync="visible">

    <el-table
      :data="tableRows"
      style="margin-bottom: 10px;"
      max-height="350"
    >
      <el-table-column
        fixed
        prop="paramName"
        label="ParamName"
        width="180"
      />
      <el-table-column
        prop="paramValue"
        label="ParamValue"
      />
      <el-table-column
        prop="scope"
        label="Scope"
        width="150"
      />
      <el-table-column
        fixed="right"
        label="Operations"
        width="150"
      >
        <template slot-scope="scope">
          <el-button type="text" size="small" :disabled="disabled" @click="displayParamInForm(scope.$index)">Edit</el-button>
          <el-button type="text" size="small" :disabled="disabled" @click="deleteParam(scope.$index)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-form ref="ruleForm" :inline="true" :model="formData" :disabled="disabled" :rules="formRules">
      <el-form-item label="Name" prop="paramName">
        <el-input v-model="formData.paramName" placeholder="param name" />
      </el-form-item>
      <el-form-item label="Value" prop="paramValue">
        <el-input v-model="formData.paramValue" placeholder="param value" />
      </el-form-item>
      <el-form-item label="Scope" prop="scope">
        <el-input value="JOB_FLOW" disabled style="width: 140px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain @click="upsertParams">Upsert</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { updateFlow, getFlow } from '@/api/job-flow.js'

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
      formData: {},
      tableRows: [],
      formRules: {
        paramName: [
          { required: true, message: 'Please input param name', trigger: 'blur' }
        ],
        paramValue: [
          { required: true, message: 'Please select param value', trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    init(data = {}) {
      this.flowId = data.flowId
      this.resetForm()
      this.fillTable()
      this.visible = true
    },

    fillTable() {
      if (!this.flowId) {
        return
      }

      getFlow(this.flowId)
        .then(res => {
          this.tableRows = Object.entries(res?.params || {})
            .map(([k, v]) => ({
              paramName: k,
              paramValue: v
            }))
        })
    },

    upsertParams() {
      if (!this.flowId) {
        this.$message({
          message: 'Flow Id not found',
          type: 'error'
        })
        return
      }
      this.$refs.ruleForm.validate((valid) => {
        if (!valid) {
          return
        }

        // step 1: update cache.
        const rows = this.tableRows
        const idx = rows.findIndex(item => item.paramName === this.formData.paramName)
        idx > -1 ? rows.splice(idx, 1, { ...this.formData }) : rows.push({ ...this.formData })

        // step 2: persist the params in cache to the backend.
        this.saveParams()
      })
    },

    displayParamInForm(index) {
      const row = this.tableRows[index]
      this.formData = {
        paramName: row.paramName,
        paramValue: row.paramValue
      }
    },

    deleteParam(index) {
      this.tableRows.splice(index, 1)
      this.saveParams()
    },

    saveParams() {
      const params = Object.fromEntries(this.tableRows.map(row => [row.paramName, row.paramValue]))
      updateFlow({ id: this.flowId, params }).then(() => {
        this.resetForm()
        this.$message.success('Job params changed, id=' + this.flowId)
      })
    },

    resetForm() {
      this.formData = {}
    }
  }
}
</script>
