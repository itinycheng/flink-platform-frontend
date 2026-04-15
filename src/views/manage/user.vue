<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px">
      <el-input
        v-model="listQuery.name"
        placeholder="Username"
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
      <el-table-column label="Username" min-width="120" align="center">
        <template slot-scope="{ row }">
          {{ row.username }}
        </template>
      </el-table-column>
      <el-table-column label="Password" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.password }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Type" width="120" align="center">
        <template slot-scope="{ row }">
          {{ row.type }}
        </template>
      </el-table-column>
      <el-table-column label="Email" min-width="180" align="center">
        <template slot-scope="{ row }">
          {{ row.email }}
        </template>
      </el-table-column>
      <el-table-column label="Status" min-width="200" align="center">
        <template slot-scope="{ row }">
          {{ row.status }}
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
          <el-button size="mini" @click="openRolesDialog(row)">Workspace 权限</el-button>
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

    <el-dialog title="Edit User" :visible.sync="dialogFormVisible">
      <el-row :gutter="20">
        <el-col :span="22">
          <el-form :model="formData" :rules="formRules" label-width="120px">
            <el-form-item label="Username" prop="username">
              <el-input v-model="formData.username" :disabled="formData.id > 0" />
            </el-form-item>
            <el-form-item label="Password" prop="password">
              <el-input v-model="formData.password" />
            </el-form-item>
            <el-form-item label="Type" prop="type">
              <el-select v-model="formData.type" style="width:100%" placeholder="Please select type">
                <el-option
                  v-for="item in userTypeList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Email" prop="email">
              <el-input v-model="formData.email" />
            </el-form-item>
            <el-form-item label="Workers" prop="workers">
              <el-select v-model="formData.workers" multiple style="width:100%" placeholder="Please select workers">
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
            <!-- <el-form-item label="Status" prop="status">
              <el-input v-model="formData.status" />
            </el-form-item>
            -->
            <el-form-item style="text-align: right;">
              <el-button @click.stop="closeForm">Cancel</el-button>
              <el-button type="primary" @click.stop="submitForm">Confirm</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-dialog>

    <el-dialog title="Workspace 权限" :visible.sync="rolesDialogVisible" width="600px">
      <div v-for="(row, index) in workspaceRoleRows" :key="index" style="display:flex; margin-bottom:10px; gap:10px;">
        <el-select v-model="row.workspaceId" placeholder="Select Workspace" style="flex:1">
          <el-option
            v-for="ws in allWorkspaceList"
            :key="ws.id"
            :label="ws.name"
            :value="ws.id"
          />
        </el-select>
        <el-select v-model="row.role" placeholder="Select Role" style="flex:1">
          <el-option v-for="r in roleOptions" :key="r" :label="r" :value="r" />
        </el-select>
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleRow(index)" />
      </div>
      <el-button type="text" icon="el-icon-plus" @click="addRoleRow">Add Row</el-button>
      <div slot="footer">
        <el-button @click="rolesDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveRoles">Save</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUser, getUserPage, createUser, updateUser } from '@/api/user'
import { getWorkspaceList } from '@/api/workspace'
import { getStatusList } from '@/api/attr'
import { getWorkerList } from '@/api/worker'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'UserList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      // edit
      dialogFormVisible: false,
      userTypeList: [],
      workerList: [],
      formData: {},
      formRules: {
        username: [
          { required: true, message: 'Please enter username', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'Please enter password', trigger: 'blur' }
        ]
      },
      // workspace roles dialog
      rolesDialogVisible: false,
      rolesUserId: null,
      workspaceRoleRows: [],
      allWorkspaceList: [],
      roleOptions: ['ADMIN', 'DEVELOPER', 'OPERATOR', 'VIEWER'],
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
    this.getWorkers()
    this.getAllWorkspaces()
  },
  methods: {
    getList() {
      getUserPage(this.listQuery).then((data) => {
        this.list = data.records
        this.total = data.total
      })
    },
    getTypes() {
      const data = { className: 'UserType' }
      getStatusList(data).then((result) => {
        this.userTypeList = result
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
      if (row.id) {
        getUser(row.id).then((data) => {
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
        updateUser(this.formData).then(id => {
          this.closeForm()
          this.getList()
        })
      } else {
        createUser(this.formData).then(id => {
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
    },
    getAllWorkspaces() {
      getWorkspaceList().then(list => {
        this.allWorkspaceList = list || []
      })
    },
    openRolesDialog(row) {
      this.rolesUserId = row.id
      const workspaces = (row.roles && row.roles.workspaces) ? row.roles.workspaces : {}
      this.workspaceRoleRows = Object.entries(workspaces).map(([id, role]) => ({
        workspaceId: Number(id),
        role
      }))
      this.rolesDialogVisible = true
    },
    addRoleRow() {
      this.workspaceRoleRows.push({ workspaceId: null, role: null })
    },
    removeRoleRow(index) {
      this.workspaceRoleRows.splice(index, 1)
    },
    saveRoles() {
      const workspaces = {}
      this.workspaceRoleRows.forEach(row => {
        if (row.workspaceId && row.role) {
          workspaces[row.workspaceId] = row.role
        }
      })
      getUser(this.rolesUserId).then(user => {
        const updated = {
          ...user,
          roles: { ...(user.roles || {}), workspaces }
        }
        updateUser(updated).then(() => {
          this.$message({ message: 'Workspace roles updated', type: 'success' })
          this.rolesDialogVisible = false
          this.getList()
        })
      })
    },
  }
}
</script>

<style scoped>
.filter-item {
  width: 200px;
  margin-right: 15px;
}
</style>
