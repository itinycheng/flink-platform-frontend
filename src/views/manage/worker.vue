<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px">
      <el-input
        v-model="listQuery.name"
        placeholder="Name"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.ip"
        placeholder="IP"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
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
      <el-table-column label="Desc" min-width="120" align="center">
        <template slot-scope="{ row }">
          {{ row.desc }}
        </template>
      </el-table-column>
      <el-table-column label="IP" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Port" width="120" align="center">
        <template slot-scope="{ row }">
          {{ row.port }}
        </template>
      </el-table-column>
      <el-table-column label="Role" min-width="180" align="center">
        <template slot-scope="{ row }">
          {{ row.role }}
        </template>
      </el-table-column>
      <el-table-column label="Heartbeat" min-width="200" align="center">
        <template slot-scope="{ row }">
          {{ row.heartbeat }}
        </template>
      </el-table-column>
      <el-table-column label="Update Time" min-width="160" align="center">
        <template slot-scope="{ row }">
          {{ row.updateTime }}
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
        <template slot-scope="{ row }">
          <el-button type="success" size="mini" @click="openForm(row)"> Edit </el-button>
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

    <el-dialog title="Edit Worker" :visible.sync="dialogFormVisible">
      <el-row :gutter="20">
        <el-col :span="22">
          <el-form :model="formData" :rules="formRules" label-width="120px">
            <el-form-item label="Name" prop="name">
              <el-input v-model="formData.name" />
            </el-form-item>
            <el-form-item label="Desc" prop="desc">
              <el-input v-model="formData.desc" type="textarea" />
            </el-form-item>
            <el-form-item label="IP" prop="ip">
              <el-input v-model="formData.ip" />
            </el-form-item>
            <el-form-item label="Port" prop="port">
              <el-input v-model="formData.port" />
            </el-form-item>
            <el-form-item label="Role" prop="role">
              <el-select v-model="formData.role" style="width:100%" placeholder="Please select role">
                <el-option
                  v-for="item in roleList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
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
import { getWorker, getWorkerPage, createWorker, updateWorker } from '@/api/worker'
import { getStatusList } from '@/api/attr'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'WorkerList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      // edit
      dialogFormVisible: false,
      roleList: [],
      formData: {},
      formRules: {
        name: [
          { required: true, message: 'Please enter name', trigger: 'blur' }
        ],
        ip: [
          { required: true, message: 'Please enter ip', trigger: 'blur' }
        ],
        port: [
          { required: true, message: 'Please enter port', trigger: 'blur' }
        ]
      },
      // list
      list: null,
      total: 0,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        ip: undefined,
        sort: '-id'
      }
    }
  },
  created() {
    this.getList()
    this.getTypes()
  },
  methods: {
    getList() {
      getWorkerPage(this.listQuery).then((data) => {
        this.list = data.records
        this.total = data.total
      })
    },
    getTypes() {
      const data = { className: 'WorkerStatus' }
      getStatusList(data).then((result) => {
        this.roleList = result
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    openForm(row) {
      if (row.id) {
        getWorker(row.id).then((data) => {
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
      this.formData = { }
    },
    submitForm() {
      if (this.formData.id) {
        updateWorker(this.formData).then(id => {
          this.closeForm()
          this.getList()
        })
      } else {
        createWorker(this.formData).then(id => {
          this.closeForm()
          this.getList()
        })
      }
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
