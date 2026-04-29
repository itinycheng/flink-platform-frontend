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
      <el-button v-waves type="primary" icon="el-icon-search" @click.stop="handleFilter">
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
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Name" min-width="150" align="center">
        <template slot-scope="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="Description" min-width="200" align="center">
        <template slot-scope="{ row }">{{ row.description }}</template>
      </el-table-column>
      <el-table-column label="Status" width="120" align="center">
        <template slot-scope="{ row }">{{ row.status }}</template>
      </el-table-column>
      <el-table-column label="Create Time" min-width="160" align="center">
        <template slot-scope="{ row }">{{ row.createTime }}</template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="160" class-name="small-padding fixed-width">
        <template slot-scope="{ row, $index }">
          <el-button type="success" size="mini" @click="openForm(row)">Edit</el-button>
          <el-button type="danger" size="mini" @click="deleteRow(row, $index)">Delete</el-button>
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

    <el-dialog title="Edit Workspace" :visible.sync="dialogFormVisible">
      <el-row :gutter="20">
        <el-col :span="22">
          <el-form :model="formData" :rules="formRules" label-width="120px">
            <el-form-item label="Name" prop="name">
              <el-input v-model="formData.name" />
            </el-form-item>
            <el-form-item label="Description" prop="description">
              <el-input v-model="formData.description" type="textarea" />
            </el-form-item>
            <el-form-item label="Status" prop="status">
              <el-select v-model="formData.status" style="width:100%" placeholder="Please select status">
                <el-option
                  v-for="item in statusList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Workers" prop="config.workers">
              <el-select v-model="formData.config.workers" multiple style="width:100%" placeholder="Please select workers">
                <el-option
                  v-for="worker in workerList"
                  :key="worker.id"
                  :label="worker.name"
                  :value="worker.id"
                >
                  <span style="float: left">{{ worker.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ worker.role }}</span>
                </el-option>
              </el-select>
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
import { getWorkspace, getWorkspacePage, createWorkspace, updateWorkspace, deleteWorkspace } from '@/api/workspace'
import { getStatusList } from '@/api/attr'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { getWorkerList } from '@/api/worker'

export default {
  name: 'WorkspaceList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      dialogFormVisible: false,
      statusList: [],
      workerList: [],
      formData: { config: {}},
      formRules: {
        name: [{ required: true, message: 'Please enter name', trigger: 'blur' }]
      },
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
    this.getCommonStatus()
    this.getWorkers()
  },
  methods: {
    getList() {
      getWorkspacePage(this.listQuery).then(data => {
        this.list = data.records
        this.total = data.total
      })
    },
    getCommonStatus() {
      getStatusList({ className: 'Status' }).then(result => {
        this.statusList = result
      })
    },
    getWorkers() {
      getWorkerList({}).then((result) => {
        this.workerList = result
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    openForm(row) {
      if (row && row.id) {
        getWorkspace(row.id).then((data) => {
          this.formData = { config: {}, ...data }
        })
      } else {
        this.formData = { config: {}}
      }
      this.dialogFormVisible = true
    },
    closeForm() {
      this.dialogFormVisible = false
      this.formData = { config: {}}
    },
    submitForm() {
      if (this.formData.id) {
        updateWorkspace(this.formData).then(() => {
          this.closeForm()
          this.getList()
        })
      } else {
        createWorkspace(this.formData).then(() => {
          this.closeForm()
          this.getList()
        })
      }
    },
    deleteRow(row, index) {
      this.$confirm(`Delete Workspace [${row.id}, ${row.name}] ?`, 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteWorkspace(row.id).then(() => {
          this.$message({ message: `Delete [${row.name}] Successfully`, type: 'success' })
          this.list.splice(index, 1)
        })
      })
    },
    sortChange({ prop, order }) {
      if (prop === 'id') {
        this.listQuery.sort = order === 'ascending' ? '+id' : '-id'
        this.handleFilter()
      }
    },
    getSortClass(key) {
      return this.listQuery.sort === `+${key}` ? 'ascending' : 'descending'
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
