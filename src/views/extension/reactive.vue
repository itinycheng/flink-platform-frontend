<template>
  <div class="reactive-container">
    <div class="form-container" style="padding: 20px 0px">
      <el-form
        ref="formData"
        :model="formData"
        status-icon
        :rules="rules"
        label-width="150px"
      >
        <el-form-item label="Job Type" prop="type">
          <el-select
            v-model="formData.type"
            style="width: 100%"
            placeholder="Please select job type"
            @change="initForm()"
          >
            <el-option
              v-for="(value, key) in jobToDbTypeMap"
              :key="key"
              :label="key"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Worker" prop="routeUrl">
          <el-select v-model="formData.routeUrl" multiple style="width: 100%">
            <el-option
              v-for="item in routeUrlList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                item.ip
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <!-- flink -->
        <template v-if="formData.type === 'FLINK_SQL'">
          <el-form-item label="Version" prop="version">
            <el-select v-model="formData.version" style="width: 100%">
              <el-option
                v-for="item in versionList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Execution Mode" prop="execMode">
            <el-select v-model="formData.execMode" style="width: 100%">
              <el-option
                v-for="item in execModeList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Deploy Mode" prop="deployMode">
            <el-select v-model="formData.deployMode" style="width: 100%">
              <el-option
                v-for="item in deployModeList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Catalogs" prop="catalogs">
            <el-select
              v-model="formData.config.catalogs"
              multiple
              style="width: 100%"
            >
              <el-option
                v-for="item in catalogList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{
                  item.description
                }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="External Jars" prop="extJars">
            <el-select
              v-model="formData.config.extJars"
              multiple
              style="width: 100%"
            >
              <el-option
                v-for="item in extJarList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{
                  item.description
                }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </template>

        <!-- sql -->
        <template v-if="formData.type === 'CLICKHOUSE_SQL'">
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
        </template>

        <el-form-item label="SQL" prop="subject">
          <SqlEditor
            ref="sqlEditor"
            :value.sync="formData.subject"
            @changeTextarea="changeTextarea($event)"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click.stop="submitForm()"
          >Execution</el-button>
          <el-button
            type="success"
            plain
            @click="formatSql()"
          >Format SQL</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="execId">
      <el-divider content-position="left">
        <el-link type="danger">execution_id: {{ execId }}</el-link>
      </el-divider>
    </div>

    <el-table
      v-if="tableHeader || tableData"
      style="width: 100%"
      border
      stripe
      size="small"
      :data="tableData"
    >
      <template v-for="(item, index) in tableHeader">
        <el-table-column :key="index" :prop="item" :label="item">
          <template slot-scope="scope">
            {{ tableData[scope.$index][index] }}
          </template>
        </el-table-column>
      </template>
    </el-table>
    <pre v-if="exception || execLog ">{{ exception }} {{ execLog }}</pre>
  </div>
</template>

<script>
import SqlEditor from '@/views/form/SqlEditor'
import { execJob, getJobToDbTypeMap, getExecLog } from '@/api/reactive'
import { getDataSourceList } from '@/api/datasource'
import { getResourceList } from '@/api/resource'
import {
  getCatalogs,
  getDeployModes,
  getRouteUrls,
  getVersions
} from '@/api/attr'

export default {
  name: 'Reactive',
  components: { SqlEditor },
  data() {
    return {
      // common
      jobToDbTypeMap: {},
      routeUrlList: [],
      // flink
      versionList: [],
      deployModeList: [],
      execModeList: [],
      catalogList: [],
      extJarList: [],
      // sql
      dataSourceList: [],
      // sync and async
      timer: undefined,
      execId: null,
      execLog: '',
      tableHeader: [],
      tableData: [],
      exception: null,
      formData: { config: {}},
      rules: {
        type: [
          {
            required: true,
            message: 'Please select job type',
            trigger: 'blur'
          }
        ],
        routeUrl: [
          {
            required: true,
            message: 'Please select worker',
            trigger: 'blur'
          }
        ],
        subject: [
          {
            required: true,
            message: 'Please enter content',
            trigger: 'change'
          }
        ],
        'config.dsId': [
          {
            required: true,
            message: 'Please choose data source',
            trigger: 'change'
          }
        ]
      }
    }
  },
  created() {
    this.initJobToDbTypes()
    this.initRouteUrlList()
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    initJobToDbTypes() {
      getJobToDbTypeMap().then((data) => {
        this.jobToDbTypeMap = data
      })
    },
    initRouteUrlList() {
      getRouteUrls().then((result) => {
        this.routeUrlList = result
      })
    },
    initForm() {
      this.resetForm()
      const jobType = this.formData.type
      if (jobType === 'FLINK_SQL') {
        this.initVersionList('FLINK')
        this.initDeployModeList('FLINK')
        this.execModeList = ['STREAMING', 'BATCH']
        this.getCatalogList()
        this.getExtJarList()
      }

      const dbType = this.jobToDbTypeMap[jobType]
      if (!dbType) {
        this.dataSourceList = []
      } else {
        getDataSourceList({ dbType: dbType }).then((data) => {
          this.dataSourceList = data
        })
      }
    },

    initVersionList(nodeType) {
      getVersions(nodeType).then((result) => {
        this.versionList = result
      })
    },
    initDeployModeList(nodeType) {
      getDeployModes(nodeType).then((result) => {
        this.deployModeList = result
      })
    },
    getCatalogList() {
      getCatalogs().then((data) => {
        this.catalogList = data
      })
    },
    getExtJarList() {
      getResourceList({ type: 'JAR' }).then((data) => {
        this.extJarList = data
      })
    },

    appendExecLog() {
      const worker = this.formData.routeUrl?.[0]
      getExecLog(this.execId, { worker: worker }).then((res) => {
        this.execLog = this.execLog + res.log
        if (!res.remain) {
          clearInterval(this.timer)
        }
      })
    },

    submitForm() {
      this.$refs['formData'].validate((valid) => {
        if (valid) {
          this.formData.config.type = this.formData.type
          execJob(this.formData).then((res) => {
            this.resetResult()
            if (res.sync) {
              this.execId = res.execId
              this.tableHeader = res.meta
              this.tableData = res.data
              this.exception = res.exception
            } else {
              this.execId = res.execId
              this.timer = setInterval(() => {
                setTimeout(this.appendExecLog, 0)
              }, 3000)
            }
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    changeTextarea(sql) {
      this.$set(this.formData, 'subject', sql)
    },
    formatSql() {
      this.$refs.sqlEditor.format()
    },
    resetForm() {
      const subject = this.formData.subject
      const type = this.formData.type
      const tmp = { config: {}}
      this.formData = { ...tmp, subject, type }
    },
    resetResult() {
      clearInterval(this.timer)
      this.timer = undefined
      this.execId = null
      this.execLog = ''
      this.tableHeader = []
      this.tableData = []
      this.exception = null
    }
  }
}
</script>

<style lang="scss" scoped>
.reactive-container {
  margin: 30px;
}

pre {
  white-space: pre-wrap;
}
</style>
