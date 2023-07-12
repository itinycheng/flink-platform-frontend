<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px">
      <el-input
        v-model="listQuery.name"
        placeholder="Name"
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
          {{ row.paramName }}
        </template>
      </el-table-column>
      <el-table-column label="Value" min-width="120" align="center">
        <template slot-scope="{ row }">
          {{ row.paramValue }}
        </template>
      </el-table-column>
      <el-table-column label="User Id" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Type" width="120" align="center">
        <template slot-scope="{ row }">
          {{ row.type }}
        </template>
      </el-table-column>
      <el-table-column label="Flow Id" min-width="200" align="center">
        <template slot-scope="{ row }">
          {{ row.flowId }}
        </template>
      </el-table-column>
      <el-table-column label="Description" min-width="180" align="center">
        <template slot-scope="{ row }">
          {{ row.description }}
        </template>
      </el-table-column>
      <el-table-column label="Create Time" min-width="160" align="center">
        <template slot-scope="{ row }">
          {{ row.createTime }}
        </template>
      </el-table-column>
      <el-table-column label="Update Time" min-width="160" align="center">
        <template slot-scope="{ row }">
          {{ row.updateTime }}
        </template>
      </el-table-column>
      <el-table-column
        label="Actions"
        align="center"
        width="180"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="success" size="mini" @click="openForm(row)"> Edit </el-button>
          <el-button type="danger" size="mini" @click="deleteRow(row, $index)"> Delete </el-button>
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

    <el-dialog title="Edit Param" :visible.sync="dialogFormVisible">
      <el-row :gutter="20">
        <el-col :span="22">
          <el-form :model="formData" :rules="formRules" label-width="120px">
            <el-form-item label="Param Name" prop="paramName">
              <el-input v-model="formData.paramName" />
            </el-form-item>
            <el-form-item label="Param Value" prop="paramValue">
              <el-input v-model="formData.paramValue" />
            </el-form-item>
            <el-form-item label="Description" prop="description">
              <el-input v-model="formData.description" type="textarea" />
            </el-form-item>
            <el-form-item label="Param Type" prop="type">
              <el-select v-model="formData.type" style="width:100%" placeholder="Please select param type">
                <el-option
                  v-for="item in paramTypeList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>

            <!-- job flow -->
            <template v-if="formData.type === 'JOB_FLOW'">
              <el-form-item label="Flow Id" prop="flowId">
                <el-input v-model="formData.flowId" />
              </el-form-item>
            </template>

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
import { getParam, getParamPage, createParam, updateParam, deleteParam } from '@/api/job-param'
import { getStatusList } from '@/api/attr'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'ParamList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      // edit
      dialogFormVisible: false,
      paramTypeList: [],
      formData: {},
      formRules: {
        paramName: [
          { required: true, message: 'Please enter name', trigger: 'blur' }
        ],
        paramValue: [
          { required: true, message: 'Please enter value', trigger: 'blur' }
        ],
        type: [
          { required: true, message: 'Please select type', trigger: 'blur' }
        ],
        flowId: [
          { required: true, message: 'Please enter flow id', trigger: 'blur' }
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
  },
  methods: {
    getList() {
      getParamPage(this.listQuery).then((data) => {
        this.list = data.records
        this.total = data.total
      })
    },
    getTypes() {
      const data = { className: 'JobParamType' }
      getStatusList(data).then((result) => {
        this.paramTypeList = result
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    openForm(row) {
      if (row.id) {
        getParam(row.id).then((data) => {
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
      this.formData = {}
    },
    submitForm() {
      if (this.formData.id) {
        updateParam(this.formData).then(id => {
          this.closeForm()
          this.getList()
        })
      } else {
        createParam(this.formData).then(id => {
          this.closeForm()
          this.getList()
        })
      }
    },
    deleteRow(row, index) {
      this.$confirm(`Delete Param [${row.id}, ${row.paramName}] ?`, 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteParam(row.id)
          .then(result => {
            this.$message({
              message: `Delete [${row.paramName}] Successfully`,
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
