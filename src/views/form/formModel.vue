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
          <el-form-item label="Catalogs" prop="catalogIds">
            <el-select v-model="formData.catalogIds" multiple style="width:100%">
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
          <el-form-item v-if="formData.type" label="SQL Statement" prop="subject">
            <SqlEditor
              v-if="formData.type == 'FLINK_SQL' || formData.type == 'CLICKHOUSE_SQL'"
              ref="sqlEditor"
              :value="formData.subject"
              @changeTextarea="changeTextarea($event)"
            />
            <el-input v-if="formData.type == 'FLINK_JAR' || formData.type == 'COMMON_JAR'" v-model="formData.subject" type="textarea" />
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
          <el-form-item label-width="10%" style="text-align: left;">
            <el-button type="primary" plain @click="submitForm('formData')">Confirm Add</el-button>
            <el-button type="success" plain @click="formatSql(formData.subject)">Format SQL</el-button>
            <el-button type="warning" plain @click="resetForm('formData')">Reset Form</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </el-drawer>
</template>

<script>
import { format } from 'sql-formatter'
import SqlEditor from './SqlEditor.vue'

export default {
  name: 'FormModel',
  components: { SqlEditor },
  filters: { },
  data() {
    return {
      visible: false,
      bool: true,
      direction: 'rtl',
      execModeList: ['STREAMING', 'BATCH'],
      catalogList: [{ id: 1, name: 'Hive', description: 'Hive default' }, { id: 2, name: 'ClickHouse', description: 'ClickHouse default' }],
      typeList: ['FLINK_SQL', 'FLINK_JAR', 'COMMON_JAR', 'CLICKHOUSE_SQL'],
      deployModeList: ['RUN_LOCAL', 'FLINK_YARN_PER', 'FLINK_YARN_SESSION', 'FLINK_YARN_RUN_APPLICATION'],
      basicInfoForm: {
        sqlMain: ''
      },
      formData: {
      },
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
    init(data = []) {
      console.log(data)
    },
    initEnums(enumsClass, callback) {
      this.$http.get('/enums', { enumsClass: enumsClass }).then(res => {
        callback(res.data.result)
      })
    },
    initCatalogList() {
      this.$http.get('/catalog-info').then(res => {
        this.catalogList = res.data.result
      })
    },
    changeTextarea(val) {
      this.$set(this.formData, 'sqlMain', val)
    },
    formatSql(val) {
      const dom = this.$refs.sqlEditor
      dom.sqlData.setValue(format(dom.sqlData.getValue(), { language: 'mysql' }))
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$http.post('/t-job-info', this.formData).then(res => {
            if (res.data.code === 200) {
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success'
              })
              this.closeDialog()
            } else {
              this.$notify({
                title: '警告',
                message: res.data.desc,
                type: 'warning'
              })
            }
          })
        } else {
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    closeDialog() {
      this.$parent.$parent.getJobInfo()
      this.$parent.$parent.dialogAddVisible = false
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
