<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px">
      <el-input
        v-model="listQuery.name"
        placeholder="Name"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.status"
        placeholder="Status"
        clearable
        class="filter-item"
      >
        <el-option
          v-for="item in statusList"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-button
        v-waves
        type="primary"
        icon="el-icon-search"
        @click.stop="handleFilter"
      >
        Search
      </el-button>
      <el-button type="primary" icon="el-icon-edit" @click.stop="openForm">
        Create
      </el-button>
    </div>

    <el-table
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Name" min-width="120" align="center">
        <template slot-scope="{ row }">
          {{ row.name }}
        </template>
      </el-table-column>
      <el-table-column label="Type" width="120" align="center">
        <template slot-scope="{ row }">
          {{ row.type }}
        </template>
      </el-table-column>
      <el-table-column label="Version" width="120" align="center">
        <template slot-scope="{ row }">
          {{ row.version }}
        </template>
      </el-table-column>
      <el-table-column label="Status" width="120" align="center">
        <template slot-scope="{ row }">
          {{ row.status }}
        </template>
      </el-table-column>
      <el-table-column label="Description" min-width="180" align="center">
        <template slot-scope="{ row }">
          {{ row.description }}
        </template>
      </el-table-column>
      <el-table-column label="Config" min-width="200" align="center">
        <template slot-scope="{ row }">
          {{ row.config }}
        </template>
      </el-table-column>
      <el-table-column label="Create Time" min-width="160" align="center">
        <template slot-scope="{ row }">
          {{ row.createTime }}
        </template>
      </el-table-column>
      <el-table-column
        label="Actions"
        align="center"
        width="180"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="success" size="mini" @click="openForm(row)"> Edit</el-button>
          <el-button v-if="row.status !== 'DELETED'" type="danger" size="mini" @click="deleteRow(row, $index)"> Delete</el-button>
          <el-button v-if="row.status === 'DELETED'" size="mini" type="danger" @click="purgeRow(row, $index)">
            Purge
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog title="Edit Config" :visible.sync="dialogFormVisible">
      <el-row :gutter="20">
        <el-col :span="22">
          <el-form :model="formData" :rules="formRules" label-width="120px">
            <el-form-item label="Name" prop="name">
              <el-input v-model="formData.name" />
            </el-form-item>
            <el-form-item label="Description" prop="description">
              <el-input v-model="formData.description" type="textarea" />
            </el-form-item>
            <el-form-item label="Type" prop="type">
              <el-select v-model="formData.type" style="width:100%" placeholder="Please select config type">
                <el-option
                  v-for="item in configTypeList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Version" prop="version">
              <el-input v-model="formData.version" />
            </el-form-item>
            <el-form-item label="Status" prop="status">
              <el-select v-model="formData.status" style="width:100%" placeholder="Please select config status">
                <el-option
                  v-for="item in statusList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Config" prop="config">
              <el-input v-model="formData.config" type="textarea" />
            </el-form-item>
            <el-form-item style="text-align: right;">
              <el-button @click.stop="closeForm">Cancel</el-button>
              <el-button type="primary" @click.stop="submitForm">Confirm</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getConfig, getConfigPage, createConfig, updateConfig, deleteConfig, purgeConfig } from '@/api/config'
import { getStatusList } from '@/api/attr'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'ConfigList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      // edit
      dialogFormVisible: false,
      configTypeList: [],
      statusList: [],
      formData: { config: {}},
      formRules: {
        name: [
          { required: true, message: 'Please enter name', trigger: 'blur' }
        ],
        type: [
          { required: true, message: 'Please select type', trigger: 'blur' }
        ]
      },
      // list
      list: null,
      total: 0,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        status: undefined,
        sort: '-id'
      }
    }
  },
  created() {
    this.getList()
    this.getTypes()
    this.getCommonStatus()
  },
  methods: {
    getList() {
      getConfigPage(this.listQuery).then((data) => {
        this.list = data.records
        this.total = data.total
      })
    },
    getTypes() {
      const data = { className: 'JobFlowType' }
      getStatusList(data).then((result) => {
        this.configTypeList = result
      })
    },
    getCommonStatus() {
      const data = { className: 'Status' }
      getStatusList(data).then((result) => {
        this.statusList = result
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    openForm(row) {
      if (row.id) {
        getConfig(row.id).then((data) => {
          const content = data.config
          if (content && typeof content === 'object') {
            data.config = JSON.stringify(content)
          }
          this.formData = data
        })
      } else {
        this.resetForm()
      }
      this.dialogFormVisible = true
    },
    closeForm() {
      this.dialogFormVisible = false
      this.resetForm()
    },
    resetForm() {
      this.formData = { config: {}}
    },
    submitForm() {
      const content = this.formData.config
      if (content) {
        try {
          this.formData.config = JSON.parse(content)
        } catch (e) {
          console.log(e)
        }
      }

      this.formData.config.type = this.formData.type
      if (this.formData.id) {
        updateConfig(this.formData).then(() => {
          this.closeForm()
          this.getList()
        })
      } else {
        createConfig(this.formData).then(() => {
          this.closeForm()
          this.getList()
        })
      }
    },
    deleteRow(row, index) {
      this.$confirm(`Delete Config [${row.id}, ${row.name}] ?`, 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteConfig(row.id)
          .then(result => {
            this.$message({
              message: `Delete [${row.name}] Successfully`,
              type: 'success'
            })
            this.list.splice(index, 1)
          })
      })
    },
    purgeRow(row, index) {
      this.$confirm(`Purge config [${row.id}, ${row.name}] ?`, 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        purgeConfig(row.id)
          .then(result => {
            this.$message({
              message: 'Purge forever successfully, id=' + result,
              type: 'success'
            })
            this.list.splice(index, 1)
          })
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>

<style scoped>
.filter-item {
  width: 200px;
  margin-right: 15px;
}
</style>
