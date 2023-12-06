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
          <el-form-item label="Node Name" prop="name">
            <el-input v-model="formData.name" />
          </el-form-item>
          <el-form-item label="Description" prop="description">
            <el-input v-model="formData.description" type="textarea" />
          </el-form-item>
          <el-form-item label="Node Type" prop="type">
            <el-select v-model="formData.type" style="width:100%" @change="changeJobType()">
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
            <el-select v-model="formData.routeUrl" multiple style="width:100%">
              <el-option
                v-for="item in routeUrlList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.ip }}</span>
              </el-option>
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
          <el-form-item label="Retry Times" prop="config.retryTimes">
            <el-input v-model="formData.config.retryTimes" placeholder="integer" />
          </el-form-item>
          <el-form-item label="Retry Interval" prop="config.retryInterval">
            <el-input v-model="formData.config.retryInterval" placeholder="Unit: s sec, m min, h hour, d day" />
          </el-form-item>

          <el-form-item label="Variables" prop="variables">
            <el-input v-model="formData.variables" placeholder="{'k1': 'v1', ...}" />
          </el-form-item>

          <template v-if="nodeType === 'FLINK'">
            <!-- flink -->
            <el-form-item v-if="formData.execMode === 'STREAMING'" label="Wait Termination" prop="config.waitForTermination">
              <el-select v-model="formData.config.waitForTermination" style="width:100%">
                <el-option
                  v-for="item in waitForEndList"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <template v-if="formData.type === 'FLINK_SQL'">
              <el-form-item label="Catalogs" prop="catalogs">
                <el-select v-model="formData.config.catalogs" multiple style="width:100%">
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
            </template>
            <el-form-item label="External Jars" prop="extJars">
              <el-select v-model="formData.config.extJars" multiple style="width:100%">
                <el-option
                  v-for="item in extJarList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.description }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Flink SQL/Jar" prop="subject">
              <CodeEditor
                v-if="formData.type === 'FLINK_SQL'"
                ref="codeEditor"
                :value.sync="formData.subject"
                :read-only="disabled"
                mode="text/x-hive"
                @changeTextarea="changeTextarea($event)"
              />
              <el-input v-else v-model="formData.subject" type="textarea" :autosize="{ minRows: 2, maxRows: 4}" />
            </el-form-item>
            <template v-if="formData.type === 'FLINK_JAR'">
              <el-form-item label="Option Args" prop="optionArgs">
                <el-input v-model="formData.config.optionArgs" type="textarea" :autosize="{ minRows: 2, maxRows: 4}" />
              </el-form-item>
              <el-form-item label="Main Class" prop="mainClass">
                <el-input v-model="formData.config.mainClass" />
              </el-form-item>
              <el-form-item label="Main Args" prop="mainArgs">
                <el-input v-model="formData.config.mainArgs" />
              </el-form-item>
            </template>
          </template>

          <template v-if="nodeType === 'SHELL'">
            <!-- shell -->
            <el-form-item label="Timeout" prop="config.timeout">
              <el-input v-model="formData.config.timeout" placeholder="Unit: s sec, m min, h hour, d day" />
            </el-form-item>
            <el-form-item label="Script" prop="subject">
              <CodeEditor
                ref="codeEditor"
                :value.sync="formData.subject"
                :read-only="disabled"
                mode="text/x-sh"
                @changeTextarea="changeTextarea($event)"
              />
            </el-form-item>
          </template>

          <template v-if="nodeType === 'SQL'">
            <!-- sql -->
            <el-form-item label="DataSource" prop="config.dsId">
              <el-select
                v-model="formData.config.dsId"
                style="width: 100%"
                placeholder="Please select data source"
              >
                <el-option
                  v-for="item in dataSourceList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="SQL" prop="subject">
              <CodeEditor
                ref="codeEditor"
                :value.sync="formData.subject"
                :read-only="disabled"
                mode="text/x-sql"
                @changeTextarea="changeTextarea($event)"
              />
            </el-form-item>
          </template>

          <template v-if="nodeType === 'CONDITION'">
            <el-form-item label="Precondition" prop="config.condition">
              <el-select
                v-model="formData.config.condition"
                style="width: 100%"
                placeholder="Please select preVertices' join condition"
              >
                <el-option
                  v-for="item in preconditionList"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </template>

          <template v-if="nodeType === 'DEPENDENT'">
            <el-form-item label="Relation" prop="config.relation">
              <el-select
                v-model="formData.config.relation"
                style="width: 100%"
                placeholder="Please select dependent relation"
              >
                <el-option
                  v-for="item in dependentRelationList"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>

            <template v-for="(dependentItem, index) in formData.config.dependentItems">
              <el-row :key="'f' + index" :gutter="10">
                <el-col :span="14">
                  <el-form-item
                    :label="'Dependent' + index"
                    :prop="'config.dependentItems.' + index + '.flowId'"
                    style="margin-bottom: 5px"
                  >
                    <el-select
                      v-model="dependentItem.flowId"
                      placeholder="Please select dependent job flow"
                      style="width: 100%"
                      size="small"
                      @change="changeDependentFlow($event, index)"
                    >
                      <el-option
                        v-for="item in jobFlowList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item
                    :prop="'config.dependentItems.' + index + '.jobId'"
                    label-width="0px"
                    style="margin-bottom: 5px"
                  >
                    <el-select
                      v-model="dependentItem.jobId"
                      placeholder="Please select dependent job"
                      style="width: 100%"
                      size="small"
                      @change="forceUpdate"
                    >
                      <el-option
                        v-for="item in jobLists[index]"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :key="'s' + index">
                <el-col :span="24">
                  <el-form-item
                    :prop="'config.dependentItems.' + index + '.statuses'"
                    style="margin-bottom: 5px"
                  >
                    <el-select
                      v-model="dependentItem.statuses"
                      placeholder="Please select expected status"
                      style="width: 100%"
                      size="small"
                      multiple
                      @change="forceUpdate"
                    >
                      <el-option
                        v-for="item in executionStatusList"
                        :key="item.name"
                        :label="item.name"
                        :value="item.name"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :key="'tr' + index" :gutter="10">
                <el-col :span="14">
                  <el-form-item
                    :prop="'config.dependentItems.' + index + '.strategy'"
                  >
                    <el-select
                      v-model="dependentItem.strategy"
                      placeholder="Please select dependent job flow"
                      style="width: 100%"
                      size="small"
                      @change="forceUpdate"
                    >
                      <el-option
                        v-for="item in dependentStrategyList"
                        :key="item.name"
                        :label="item.name"
                        :value="item.name"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :prop="'config.dependentItems.' + index + '.duration'"
                    label-width="0px"
                  >
                    <el-input
                      v-model="dependentItem.duration"
                      size="small"
                      placeholder="Unit: s sec, m min, h hour, d day"
                      @change="forceUpdate"
                      @blur="forceUpdate"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="2">
                  <el-button icon="el-icon-delete" size="small" circle @click="deleteDependentItem(dependentItem)" />
                </el-col>
              </el-row>
            </template>
          </template>

          <el-form-item label-width="10%" style="text-align: right;">
            <el-button type="warning" plain @click="resetForm()">Reset Form</el-button>
            <el-button v-if="isSqlNode()" type="success" plain @click="formatSql()">Format SQL</el-button>
            <el-button v-if="nodeType === 'DEPENDENT'" type="success" plain @click="addDependentItem()">Add Dependent</el-button>
            <el-button type="primary" plain @click="submitForm()">Confirm Add</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </el-drawer>
</template>

<script>
import CodeEditor from './CodeEditor.vue'
import { getJobOrJobRun, createJob, updateJob, getJobList } from '@/api/job.js'
import { getNodeTypes, getDeployModes, getRouteUrls, getVersions, getPreconditions, getDependentRelations, getStatusList } from '@/api/attr.js'
import { getResourceList } from '@/api/resource.js'
import { getDataSourceList } from '@/api/datasource'
import { getFlowIdNameList } from '@/api/job-flow'
import { getCatalogs } from '@/api/catalog'

export default {
  name: 'FormModel',
  components: { CodeEditor },
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
      waitForEndList: [true, false],
      catalogList: [],
      extJarList: [],
      typeList: [],
      deployModeList: [],
      executionStatusList: [],
      dependentStrategyList: [],
      routeUrlList: [],
      versionList: [],
      dataSourceList: [],
      preconditionList: [],
      dependentRelationList: [],
      jobLists: [],
      jobFlowList: [],
      formData: { config: {}},
      rules: {
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
        ],
        'config.retryTimes': [
          { required: true, message: 'Please enter retry times', trigger: 'change' }
        ],
        'config.dsId': [{
          required: true, message: 'Please choose data source', trigger: 'change'
        }],
        'config.condition': [{
          required: true, message: 'Please choose vertex precondition', trigger: 'change'
        }],
        'config.relation': [{
          required: true, message: 'Please choose dependent relation', trigger: 'change'
        }],
        'config.timeout': [
          { required: true, message: 'Please enter timeout', trigger: 'change' }]
      }
    }
  },
  created() {
  },
  methods: {
    initFn(node) {
      this.node = node
      const data = node.getData()
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
            this.getExtJarList()
            break
          case 'DEPENDENT':
            this.initDependentRelationList()
            this.initDependentJobFlowList()
            this.initExecutionStatusList()
            this.initDependentStrategyList()
            break
          case 'SHELL':
          default:
            break
        }
      }

      if (data.id) {
        const type = this.$route.params.type
        getJobOrJobRun(data.id, type).then(result => {
          const variables = JSON.stringify(result.variables || {})
          this.initDependentJobLists(result.config)
          this.formData = { ...result, variables }
          this.changeJobType()
          if (this.$refs.codeEditor) {
            this.$refs.codeEditor.setVal(this.formData.subject)
          }
        })
      } else {
        this.resetForm()
        this.formData.flowId = this.$route.params.id
      }
    },
    changeJobType() {
      const jobType = this.formData.type
      getDataSourceList({ jobType: jobType }).then((data) => {
        this.dataSourceList = data
      })
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
    initDependentRelationList() {
      getDependentRelations().then(result => {
        this.dependentRelationList = result
      })
    },
    initDependentJobFlowList() {
      const data = { status: 'ONLINE,SCHEDULING' }
      getFlowIdNameList(data).then(data => {
        this.jobFlowList = data
      })
    },
    initDependentJobLists(config) {
      const dependentItems = config.dependentItems || []
      for (var i = 0; i < dependentItems.length; i++) {
        getJobList({ flowId: dependentItems[i].flowId }).then(data => {
          this.jobLists.splice(i, 1, data || [])
        })
      }
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
    initExecutionStatusList() {
      var data = { className: 'ExecutionStatus' }
      getStatusList(data).then((result) => {
        this.executionStatusList = result
      })
    },
    initDependentStrategyList() {
      var data = { className: 'DependentStrategy' }
      getStatusList(data).then((result) => {
        this.dependentStrategyList = result
      })
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
    getExtJarList() {
      getResourceList({ type: 'JAR' }).then(data => {
        this.extJarList = data
      })
    },
    changeDependentFlow(flowId, index) {
      getJobList({ flowId: flowId, flag: 'flow' }).then(data => {
        this.jobLists.splice(index, 1, data || [])
        this.formData.config.dependentItems[index].jobId = null
        this.$forceUpdate()
      })
    },
    addDependentItem() {
      if (!this.formData.config.dependentItems) {
        this.formData.config.dependentItems = []
      }
      this.formData.config.dependentItems.push({ flowId: null })
      this.$forceUpdate()
    },
    deleteDependentItem(dependentItem) {
      var dependentItems = this.formData.config.dependentItems
      var index = dependentItems.indexOf(dependentItem)
      if (index !== -1) {
        dependentItems.splice(index, 1)
      }
      this.$forceUpdate()
    },
    forceUpdate() {
      this.$forceUpdate()
    },
    isSqlNode() {
      const formType = this.formData.type
      return formType && formType.indexOf('SQL') !== -1
    },
    changeTextarea(sql) {
      this.$set(this.formData, 'subject', sql)
    },
    formatSql() {
      this.$refs.codeEditor.format()
    },
    submitForm() {
      this.$refs['formData'].validate((valid) => {
        if (!valid) {
          return false
        }

        this.formData.config.type = this.formData.type
        const variables = JSON.parse(this.formData.variables || '{}')
        const newData = { ...this.formData, variables }
        if (newData.id) {
          updateJob(newData).then(data => {
            this.modifyNode(data)
            this.$message.success('Job Updated, id=' + data.id)
            this.visible = false
          })
        } else {
          createJob(newData).then(data => {
            this.modifyNode(data)
            this.$message.success('Job Created, id=' + data.id)
            this.visible = false
          })
        }
      })
    },
    modifyNode(resData) {
      const data = this.node.getData()
      let precondition = 'AND'
      if (resData?.type === 'CONDITION') {
        precondition = resData.config.condition
      }
      this.node.setData({
        ...data,
        id: resData.id,
        name: resData.name,
        precondition: precondition
      })
    },
    resetForm() {
      if (this.$refs['formData']) {
        this.$refs['formData'].resetFields()
      } else {
        this.formData = { config: {}}
      }
      if (this.$refs.codeEditor) {
        this.$refs.codeEditor.setVal('')
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
