<template>
  <el-drawer
    title="Current Node settings"
    :visible.sync="visible"
    :direction="direction"
    :modal="false"
    :modal-append-to-body="false"
    size="40%"
  >
    <el-row :gutter="20">
      <el-col :span="22">
        <el-form ref="formData" :model="formData" :rules="rules" label-width="150px">
          <el-form-item label="Node Name" prop="name">
            <el-input v-model="formData.name" />
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
          <el-form-item label="Crontab" prop="cronExpr">
            <el-input v-model="formData.cronExpr" />
          </el-form-item>
          <el-form-item label="Worker Group" prop="routeUrl">
            <el-input v-model="formData.routeUrl" />
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
          <el-form-item label="Catalogs" prop="catalogs">
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
              v-if="isSql(formData.type)"
              ref="sqlEditor"
              :value="formData.subject"
              @changeTextarea="changeTextarea($event)"
            />
            <el-input v-else v-model="formData.subject" type="textarea" />
          </el-form-item>
          <el-form-item label="External Jars" prop="extJars">
            <el-input v-model="formData.extJars" />
          </el-form-item>
          <el-form-item label="Main Class" prop="mainClass">
            <el-input v-model="formData.mainClass" />
          </el-form-item>
          <el-form-item label="Main Args" prop="mainArgs">
            <el-input v-model="formData.mainArgs" />
          </el-form-item>
          <el-form-item label="Description" prop="jobDesc">
            <el-input v-model="formData.description" type="textarea" />
          </el-form-item>
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
import { format } from 'sql-formatter'
import SqlEditor from './SqlEditor.vue'
import { getJob, createJob, updateJob } from '@/api/job.js'

export default {
  name: 'FormModel',
  components: { SqlEditor },
  filters: { },
  data() {
    return {
      visible: false,
      node: {},
      direction: 'rtl',
      execModeList: [],
      catalogList: [],
      typeList: [],
      deployModeList: [],
      formData: {},
      rules: {
        name: [
          { required: true, message: '请输入任务名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择任务类型', trigger: 'change' }
        ],
        execMode: [
          { required: true, message: '请选择执行模式', trigger: 'change' }
        ],
        deployMode: [
          { required: true, message: '请选择发布模式', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    // this.initCatalogList()
  },
  methods: {
    initFn(node) {
      this.node = node
      const data = node.getData()
      switch (data.type) {
        case 'FLINK':
          this.execModeList = ['STREAMING', 'BATCH']
          this.typeList = ['FLINK_SQL', 'FLINK_JAR']
          this.deployModeList = ['FLINK_YARN_PER', 'FLINK_YARN_SESSION', 'FLINK_YARN_RUN_APPLICATION']
          this.catalogList = this.initCatalogList()
          break
        case 'SHELL':
          break
      }

      if (data.id) {
        getJob(data.id).then(res => {
          const result = res.data
          const extJars = result.extJars.join(',')
          this.formData = { ...result, extJars }
        })
      } else {
        this.resetForm()
      }
    },
    initEnums(enumsClass, callback) {
      this.$http.get('/enums', { enumsClass: enumsClass }).then(res => {
        callback(res.data.result)
      })
    },
    initCatalogList() {
      this.$http.get('/catalog/list').then(res => {
        this.catalogList = res.data.data
      })
    },
    isSql(type) {
      return type === 'FLINK_SQL' || type === 'CLICKHOUSE_SQL'
    },
    changeTextarea(sql) {
      this.$set(this.formData, 'subject', sql)
    },
    formatSql() {
      const editor = this.$refs.sqlEditor
      editor.sqlData.setValue(format(editor.sqlData.getValue(), { language: 'mysql' }))
    },
    submitForm() {
      this.$refs['formData'].validate((valid) => {
        if (!valid) {
          return false
        }

        const extJars = this.formatExtJars(this.formData.extJars)
        const newData = {
          ...this.formData,
          extJars
        }
        if (newData.id) {
          updateJob(newData).then(res => {
            this.modifyNode(res.data)
            this.$notify({
              title: 'Success',
              message: 'Job Updated, id=' + res.data.id,
              type: 'success'
            })
            this.resetForm()
            this.visible = false
          })
        } else {
          createJob(newData).then(res => {
            this.modifyNode(res.data)
            this.$notify({
              title: 'Success',
              message: 'Job Created, id=' + res.data.id,
              type: 'success'
            })
            this.resetForm()
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
        name: resData.name
      })
    },
    resetForm() {
      if (this.$refs['formData']) {
        this.$refs['formData'].resetFields()
      } else {
        this.formData = {}
      }
    },
    formatExtJars(extJars) {
      if (extJars) {
        return extJars.split(',')
      } else {
        return []
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
