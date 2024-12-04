<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px">
      <el-input
        v-model="listQuery.id"
        type="number"
        placeholder="Job ID"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
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
      <el-date-picker
        v-model="timeRange"
        style="margin-right: 15px;"
        type="datetimerange"
        value-format="yyyy-MM-dd HH:mm:ss"
        :picker-options="pickerOptions"
        range-separator="-"
        start-placeholder="Start date"
        end-placeholder="End date"
        align="right"
      />
      <el-button
        v-waves
        type="primary"
        icon="el-icon-search"
        @click.stop="handleFilter"
      >
        Search
      </el-button>

      <el-dropdown trigger="click" style="margin: 0 10px;" @command="handleCreate">
        <el-button type="primary" icon="el-icon-edit">
          Create <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :command="{type: 'SHELL'}">Shell</el-dropdown-item>
          <el-dropdown-item :command="{type: 'FLINK'}">Flink</el-dropdown-item>
          <el-dropdown-item :command="{type: 'SQL'}">SQL</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button
        type="primary"
        icon="el-icon-edit"
        @click="openParamDialog()"
      />
    </div>

    <el-table
      v-loading="listLoading"
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
          {{ row.id }}
        </template>
      </el-table-column>
      <el-table-column label="Name" min-width="200" align="center">
        <template slot-scope="{ row }">
          <el-button type="text" @click="handleAction({row, toStatus: 'EDIT'})">{{ row.name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="Description" min-width="250" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Job Run" min-width="150" align="center">
        <template slot-scope="{ row }">
          <router-link
            :to="{name: 'ProjectJobRuns', query: {id: row.jobRunId, flowRunId: row.flowRunId, timeRange: []}}"
            class="link-type green-text"
          >
            {{ row.jobRunId }} - {{ row.jobRunStatus }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="Flow Id" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.flowId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Type" min-width="120" align="center">
        <template slot-scope="{ row }">
          <span style="font-size: small;">{{ row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" width="120" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
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
        width="120"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-dropdown trigger="click" style="margin: 0 10px;" @command="handleAction">
            <el-button type="success" size="mini"> Action </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="{row, toStatus: 'EDIT'}">Edit</el-dropdown-item>
              <el-dropdown-item :command="{row, toStatus: 'RUN_ONCE'}">Run Once</el-dropdown-item>
              <el-dropdown-item v-if="row.status !== 'DELETE'" :command="{row, toStatus: 'DELETE'}">Delete</el-dropdown-item>
              <el-dropdown-item v-if="row.status === 'DELETE'" :command="{row, toStatus: 'ONLINE'}">Online</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.size"
      @pagination="getList"
    />
    <FormModel ref="formModel" :disabled="false" @callback="getList" />
    <EditParamDialog ref="editParamDialog" :disabled="false" />
  </div>
</template>

<script>
import { getJobPage, updateJob, getJobRun } from '@/api/job'
import { getStatusList, getNodeClassification } from '@/api/attr.js'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { pickerOptions } from '@/components/DatePicker/date-picker'
import FormModel from '../form/formModel'
import { runOnceFlow } from '@/api/job-flow'

import EditParamDialog from './jobParams.vue'

export default {
  name: 'ProjectList',
  components: { Pagination, FormModel, EditParamDialog },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        ONLINE: 'primary',
        OFFLINE: 'info',
        DELETE: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      // time range
      timeRange: [],
      pickerOptions: pickerOptions,
      // dialog
      dialogVisible: false,
      jsonData: {},
      // list
      statusList: [],
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 20,
        id: undefined,
        name: undefined,
        flowId: undefined,
        includeJobRuns: true,
        sort: '-id'
      }
    }
  },

  created() {
    this.listQuery.flowId = this.$route.params.id
    this.getStatus()
    this.getList()
  },

  methods: {
    getStatus() {
      var data = { className: 'JobStatus' }
      getStatusList(data).then((result) => {
        this.statusList = result
      })
    },
    getList() {
      this.listLoading = true
      this.listQuery.startTime = this.timeRange?.[0]
      this.listQuery.endTime = this.timeRange?.[1]
      getJobPage(this.listQuery).then((data) => {
        this.total = data.total
        this.list = data.records
        setTimeout(() => {
          this.listLoading = false
        }, 200)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleAction(data) {
      const { row, toStatus } = data
      switch (toStatus) {
        case 'EDIT':
          this.handleUpdate(row)
          break
        case 'DELETE':
          this.handleDelete(row)
          break
        case 'ONLINE':
          this.handleOnline(row)
          break
        case 'RUN_ONCE':
          this.handleRunOnce(row)
          break
      }
    },
    handleCreate(data) {
      var node = {
        id: null,
        name: '',
        flowId: this.listQuery.flowId,
        ...data,
        getData() {
          return this
        },
        setData(data) {
          Object.assign(this, data)
        }
      }
      this.$refs.formModel.initFn(node)
      this.$refs.formModel.visible = true
    },
    openParamDialog() {
      const data = { flowId: this.listQuery.flowId, type: '' }
      this.$refs.editParamDialog.init(data)
    },
    async handleUpdate(row) {
      var nodeData = {
        id: row.id,
        name: row.name,
        precondition: row.precondition,
        status: row.status,
        type: await getNodeClassification(row.type)
      }
      nodeData.getData = () => nodeData
      nodeData.setData = (data) => Object.assign(this, data)

      this.$refs.formModel.initFn(nodeData)
      this.$refs.formModel.visible = true
    },
    handleDelete(row) {
      this.$confirm(`Delete job [${row.id}, ${row.name}] ?`, 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        updateJob({ id: row.id, status: 'DELETE' })
          .then(result => {
            this.$message({
              message: 'Delete successfully, job id=' + result,
              type: 'success'
            })
            this.getList()
          })
      })
    },
    handleOnline(row) {
      updateJob({ id: row.id, status: 'ONLINE' })
        .then(result => {
          this.$message({
            message: 'Online successfully, job id=' + result,
            type: 'success'
          })
          this.getList()
        })
    },
    handleRunOnce(row) {
      const { id, flowId } = row
      if (!id || !flowId) {
        this.$message.success(`Job run once failed, job_id=${id}`)
      }

      var data = { startJobId: row.id, strategy: 'ONLY_CUR_JOB' }
      runOnceFlow(row.flowId, data).then((flowRunId) => {
        this.$message.success(`Job run once Successfully, flow_run_id=${flowRunId}, job_id=${id}`)
      })
    },
    displayRowJson(id) {
      getJobRun(id).then(result => {
        this.jsonData = result
        this.dialogVisible = true
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

<style>
.green-text {
  color: #67C23A;
}

.filter-item {
  width: 200px;
  margin-right: 15px;
}

.jv-container .jv-string {
    white-space: nowrap !important;
}
</style>
