<template>
  <el-drawer
    title="Current Node settings"
    :visible.sync="visible"
    :destroy-on-close="true"
    :wrapper-closable="false"
    :direction="direction"
    :modal="true"
    :modal-append-to-body="true"
    size="40%"
  >
    <el-row :gutter="20">
      <el-col :span="22">
        <el-form ref="formData" :model="formData" :disabled="disabled" :rules="rules" label-width="150px">
          <el-form-item label="Execute Condition" prop="precondition">
            <el-select v-model="formData.precondition" style="width:100%">
              <el-option
                v-for="item in preconditionList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Node Name" prop="name">
            <el-input v-model="formData.name" />
          </el-form-item>
          <el-form-item label="Description" prop="description">
            <el-input v-model="formData.description" type="textarea" />
          </el-form-item>
          <el-form-item label="Node Type" prop="type">
            <el-select v-model="formData.type" style="width:100%">
              <el-option
                v-for="item in typeList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Version" prop="version">
            <el-select v-model="formData.version" style="width:100%">
              <el-option
                v-for="item in versionList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Worker Group" prop="routeUrl">
            <el-select v-model="formData.routeUrl" style="width:100%">
              <el-option
                v-for="item in routeUrlList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Execution Mode" prop="execMode">
            <el-select v-model="formData.execMode" style="width:100%">
              <el-option
                v-for="item in execModeList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Deploy Mode" prop="deployMode">
            <el-select v-model="formData.deployMode" style="width:100%">
              <el-option
                v-for="item in deployModeList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Variables" prop="variables">
            <el-input v-model="formData.variables" placeholder="{'k1': 'v1', ...}" />
          </el-form-item>

          <template v-if="nodeType === 'FLINK'">
            <!-- flink -->
            <el-form-item v-if="formData.type === 'FLINK_SQL'" label="Catalogs" prop="catalogs">
              <el-select v-model="formData.catalogs" multiple style="width:100%">
                <el-option
                  v-for="item in catalogList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.description }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Subject" prop="subject">
              <SqlEditor
                v-if="isFlinkSql(formData.type)"
                ref="sqlEditor"
                :value.sync="formData.subject"
                :read-only="disabled"
                @changeTextarea="changeTextarea($event)"
              />
              <el-input v-else v-model="formData.subject" type="textarea" :autosize="{ minRows: 4, maxRows: 13}" />
            </el-form-item>
            <el-form-item label="External Jars" prop="extJars">
              <el-input v-model="formData.extJars" placeholder="['hdfs:///path1', ...]" />
            </el-form-item>
            <el-form-item label="Main Class" prop="mainClass">
              <el-input v-model="formData.mainClass" />
            </el-form-item>
            <el-form-item label="Main Args" prop="mainArgs">
              <el-input v-model="formData.mainArgs" />
            </el-form-item>
          </template>

          <template v-if="nodeType === 'SHELL'">
            <!-- shell -->
            <el-form-item label="Subject" prop="subject">
              <el-input v-model="formData.subject" type="textarea" />
            </el-form-item>
          </template>

          <template v-if="nodeType === 'SQL'">
            <!-- sql -->
            <el-form-item label="Subject" prop="subject">
              <SqlEditor
                ref="sqlEditor"
                :value.sync="formData.subject"
                :read-only="disabled"
                @changeTextarea="changeTextarea($event)"
              />
            </el-form-item>
          </template>

          <el-form-item label-width="10%" style="text-align: right;">
            <el-button type="warning" plain @click="resetForm()">Reset Form</el-button>
            <el-button type="success" plain @click="formatSql()">Format SQL</el-button>
            <el-button type="primary" plain @click="submitForm()">Confirm Add</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </el-drawer>
</template>

<script>
import SqlEditor from './SqlEditor.vue'
import { getJobOrJobRun, createJob, updateJob } from '@/api/job.js'
import { getCatalogs, getNodeTypes, getDeployModes, getRouteUrls, getVersions, getPreconditions } from '@/api/attr.js'

export default {
  name: 'FormModel',
  components: { SqlEditor },
  filters: { },
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      node: {},
      nodeType: '',
      direction: 'rtl',
      execModeList: [],
      catalogList: [],
      typeList: [],
      deployModeList: [],
      routeUrlList: [],
      versionList: [],
      preconditionList: [],
      formData: {},
      rules: {
        precondition: [
          { required: true, message: 'Please select execute condition', trigger: 'blur' }
        ],
        name: [
          { required: true, message: 'Please input node name', trigger: 'blur' }
        ],
        type: [
          { required: true, message: 'Please select node type', trigger: 'change' }
        ],
        version: [
          { required: true, message: 'Please select version', trigger: 'change' }
        ],
        routeUrl: [
          { required: true, message: 'Please select worker group', trigger: 'change' }
        ],
        execMode: [
          { required: true, message: 'Please select execution mode', trigger: 'change' }
        ],
        deployMode: [
          { required: true, message: 'Please select deploy mode', trigger: 'change' }
        ]
      }
    }
  },
  created() {
  },
  methods: {
    initFn(node) {
      this.node = node
      const data = node.getData()
      const precondition = data.precondition
      this.nodeType = data?.type
      this.initRouteUrlList()
      this.initPreconditionList()
      if (this.nodeType) {
        this.initNodeTypeList(this.nodeType)
        this.initExecModeList(this.nodeType)
        this.initDeployModeList(this.nodeType)
        this.initVersionList(this.nodeType)
        switch (this.nodeType) {
          case 'FLINK':
            this.getCatalogList()
            break
          case 'SHELL':
            break
        }
      }

      if (data.id) {
        const type = this.$route.params.type
        getJobOrJobRun(data.id, type).then(result => {
          const extJars = JSON.stringify(result.extJars || [])
          const variables = JSON.stringify(result.variables || {})
          this.formData = { ...result, extJars, variables, precondition }
          if (this.$refs.sqlEditor) {
            this.$refs.sqlEditor.setVal(this.formData.subject)
          }
        })
      } else {
        this.resetForm()
        this.formData.flowId = this.$route.params.id
        this.formData.precondition = precondition
      }
    },
    initRouteUrlList() {
      getRouteUrls().then(result => {
        this.routeUrlList = result
      })
    },
    initPreconditionList() {
      getPreconditions().then(result => {
        this.preconditionList = result
      })
    },
    initVersionList(nodeType) {
      getVersions(nodeType).then(result => {
        this.versionList = result
      })
    },
    initDeployModeList(nodeType) {
      getDeployModes(nodeType).then(result => {
        this.deployModeList = result
      })
    },
    initExecModeList(nodeType) {
      if (nodeType === 'FLINK') {
        this.execModeList = ['STREAMING', 'BATCH']
      } else {
        this.execModeList = ['BATCH']
      }
    },
    initNodeTypeList(nodeType) {
      getNodeTypes(nodeType).then(result => {
        this.typeList = result
      })
    },
    getCatalogList() {
      getCatalogs().then(data => {
        this.catalogList = data
      })
    },
    isFlinkSql(type) {
      return type === 'FLINK_SQL'
    },
    changeTextarea(sql) {
      this.$set(this.formData, 'subject', sql)
    },
    formatSql() {
      this.$refs.sqlEditor.format()
    },
    submitForm() {
      this.$refs['formData'].validate((valid) => {
        if (!valid) {
          return false
        }

        const extJars = JSON.parse(this.formData.extJars || '[]')
        const variables = JSON.parse(this.formData.variables || '{}')
        const newData = {
          ...this.formData,
          extJars,
          variables
        }
        if (newData.id) {
          updateJob(newData).then(data => {
            this.modifyNode(newData)
            this.$notify({
              title: 'Success',
              message: 'Job Updated, id=' + data.id,
              type: 'success'
            })
            this.visible = false
          })
        } else {
          createJob(newData).then(data => {
            this.modifyNode(newData)
            this.$notify({
              title: 'Success',
              message: 'Job Created, id=' + data.id,
              type: 'success'
            })
            this.visible = false
          })
        }
      })
    },
    modifyNode(resData) {
      const data = this.node.getData()
      this.node.setData({
        ...data,
        id: resData.id,
        name: resData.name,
        precondition: resData.precondition
      })
    },
    resetForm() {
      if (this.$refs['formData']) {
        this.$refs['formData'].resetFields()
      } else {
        this.formData = {}
      }
      if (this.$refs.sqlEditor) {
        this.$refs.sqlEditor.setVal('')
      }
    }
  }
}
</script>

<style lang="scss">
.el-drawer.rtl{
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
