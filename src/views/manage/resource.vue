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

    <div class="dir-navigate">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/manage/resource' }">HOME</el-breadcrumb-item>
        <template v-for="parent in breadcrumb">
          <el-breadcrumb-item :key="'id_' + parent.id" :to="{ path: '/manage/resource/' + parent.id }">{{ parent.name }}</el-breadcrumb-item>
        </template>
      </el-breadcrumb>
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
          <router-link
            v-if="row.type === 'DIR'"
            :to="'/manage/resource/' + row.id"
            class="link-type"
          >{{ row.name }}</router-link>
          <el-link v-else type="info">{{ row.name }}</el-link>
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
      <el-table-column label="Full Name" min-width="180" align="center">
        <template slot-scope="{ row }">
          {{ row.fullName }}
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
          <el-button type="primary" icon="el-icon-edit" circle :disabled="row.type === 'DIR'" @click="openForm(row)" />
          <el-button type="danger" icon="el-icon-delete" circle @click="deleteRow(row, $index)" />
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

    <el-dialog title="Edit Resource" :visible.sync="dialogFormVisible">
      <el-row :gutter="20">
        <el-col :span="22">
          <el-form :model="formData" :rules="formRules" label-width="150px">
            <el-form-item label="Name" prop="name">
              <el-input v-model="formData.name" />
            </el-form-item>
            <el-form-item label="Description" prop="description">
              <el-input v-model="formData.description" type="textarea" />
            </el-form-item>
            <el-form-item label="Type" prop="type">
              <el-select v-model="formData.type" style="width:100%" placeholder="Please select resource type">
                <el-option
                  v-for="item in resourceTypeList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>

            <!-- File -->
            <template v-if="formData.type && formData.type !== 'DIR'">
              <el-form-item label="File" prop="type">
                <el-upload
                  :action="baseUrl + '/resource/upload'"
                  :headers="headers"
                  :data="{ pid: this.$route.params.id }"
                  :before-remove="removeFile"
                  :on-success="handleUploadSuccess"
                  :on-error="handleUploadError"
                  :limit="1"
                  :file-list="fileList"
                >
                  <el-button size="small" type="primary">Upload</el-button>
                </el-upload>
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
import { getResource, getWithParents, getResourcePage, createResource, updateResource, deleteResource, deleteFile } from '@/api/resource'
import { getStatusList } from '@/api/attr'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { getToken } from '@/utils/auth'

export default {
  name: 'ResourceList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      id: this.$route.params.id,
      dialogFormVisible: false,
      breadcrumb: [],
      // file upload
      baseUrl: process.env.VUE_APP_BASE_API,
      fileList: [],
      headers: {
        'X-Token': getToken()
      },
      // default
      resourceTypeList: [],
      formData: {},
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
        pid: this.$route.params.id,
        name: undefined,
        status: undefined,
        sort: '-id'
      }
    }
  },
  created() {
    this.initBreadcrumb()
    this.getList()
    this.getTypes()
  },
  methods: {
    getList() {
      getResourcePage(this.listQuery).then((data) => {
        this.list = data.records
        this.total = data.total
      })
    },
    getTypes() {
      const data = { className: 'ResourceType' }
      getStatusList(data).then((result) => {
        this.resourceTypeList = result
      })
    },
    initBreadcrumb() {
      if (this.id) {
        getWithParents(this.id).then((data) => {
          this.breadcrumb = data
        })
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    removeFile() {
      deleteFile({ fullName: this.formData.fullName }).then(() => {
        this.formData.name = ''
        this.formData.fullName = ''
        this.fileList = []
      })
    },
    handleUploadSuccess(resp) {
      if (resp.code === 0) {
        const { name, fullName } = resp.data
        this.formData = { ...this.formData, name, fullName }
      } else {
        this.$message.error(resp.desc)
      }
    },
    handleUploadError() {
      this.$message.error('Upload failed.')
    },
    openForm(row) {
      if (row.id) {
        getResource(row.id).then((data) => {
          this.formData = data
          this.fileList = [{
            name: data.name,
            url: data.fullName
          }]
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
      this.fileList = []
    },
    submitForm() {
      this.formData.pid = this.$route.params.id
      if (this.formData.id) {
        updateResource(this.formData).then(id => {
          this.closeForm()
          this.getList()
        })
      } else {
        createResource(this.formData).then(id => {
          this.closeForm()
          this.getList()
        })
      }
    },
    deleteRow(row, index) {
      this.$confirm(`Delete Resource [${row.id}, ${row.name}] ?`, 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteResource(row.id)
          .then(result => {
            this.$message({
              message: `Delete [${row.name}] Successfully`,
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
.dir-navigate {
  padding: 24px;
  border: 1px solid #ebebeb;
  border-radius: 3px;
}
</style>
