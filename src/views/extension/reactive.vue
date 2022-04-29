<template>
  <div class="reactive-container">
    <div class="form-container" style="padding: 20px 0px">
      <el-form ref="formData" :model="formData" status-icon :rules="rules" label-width="100px">
        <el-form-item label="DataSource" prop="datasourceId">
          <el-select v-model="formData.datasourceId" style="width:100%" placeholder="Please select data source">
            <el-option
              v-for="item in dataSourceList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="content" prop="content">
          <SqlEditor
            ref="sqlEditor"
            :value.sync="formData.content"
            @changeTextarea="changeTextarea($event)"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click.stop="submitForm()">Execution</el-button>
          <el-button type="success" plain @click="formatSql()">Format SQL</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table style="width: 100%" border stripe size="small" :data="tableData">
      <template v-for="(item, index) in tableHeader">
        <el-table-column :key="index" :prop="item" :label="item">
          <template slot-scope="scope">
            {{ tableData[scope.$index][index] }}
          </template>
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<script>
import SqlEditor from '@/views/form/SqlEditor'
import { syncExec } from '@/api/reactive'
import { getDataSourceList } from '@/api/datasource'

export default {
  name: 'Reactive',
  components: { SqlEditor },
  data() {
    return {
      dataSourceList: [],
      tableHeader: [],
      tableData: [],
      formData: {},
      rules: {
        datasourceId: [
          { required: true, message: 'Please select data source', trigger: 'blur' }
        ],
        content: [
          { required: true, message: 'Please enter content', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getDataSources()
  },
  methods: {
    getDataSources() {
      getDataSourceList().then(data => {
        this.dataSourceList = data
      })
    },

    submitForm() {
      this.$refs['formData'].validate((valid) => {
        if (valid) {
          syncExec(this.formData).then(res => {
            this.tableHeader = res.meta
            this.tableData = res.data
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    changeTextarea(sql) {
      this.$set(this.formData, 'content', sql)
    },
    formatSql() {
      this.$refs.sqlEditor.format()
    }

  }
}
</script>

<style lang="scss" scoped>
  .reactive-container {
    margin: 30px;
  }
</style>
