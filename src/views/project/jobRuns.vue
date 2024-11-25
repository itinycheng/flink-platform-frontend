<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px">
      <el-input
        v-model="listQuery.id"
        type="number"
        placeholder="ID"
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
          v-for="item in listStatus"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-input
        v-model="listQuery.flowRunId"
        placeholder="Flow Run Id"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.jobId"
        placeholder="Job Id"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-date-picker
        v-model="timeRange"
        style="margin-right: 15px;"
        type="datetimerange"
        value-format="yyyy-MM-dd HH:mm:ss"
        :picker-options="pickerOptions"
        range-separator="-"
        start-placeholder="Start endTime"
        end-placeholder="End endTime"
        :default-time="['00:00:00', '23:59:59']"
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
          <span v-if="row.backInfo && row.backInfo.trackingUrl">
            <el-link type="primary" :href="row.backInfo.trackingUrl" target="_blank">{{ row.id }}</el-link>
          </span>
          <span v-else>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Name" min-width="300" align="center">
        <template slot-scope="{ row }">
          <el-button type="text" @click="displayRowJson(row.id)">{{ row.name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="Job Id" min-width="120" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.jobId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Flow Run Id" min-width="120" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.flowRunId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Type" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Version" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.version }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="Config" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.config }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="Host" min-width="120" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.host }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" width="120" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Duration" width="120" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.duration }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Submit Time" min-width="160" align="center">
        <template slot-scope="{ row }">
          {{ row.submitTime }}
        </template>
      </el-table-column>
      <el-table-column label="Stop Time" min-width="160" align="center">
        <template slot-scope="{ row }">
          {{ row.stopTime }}
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
        width="120"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-dropdown trigger="click" style="margin: 0 10px;" @command="handleMore">
            <el-button type="success" size="mini"> Action </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="{row, toStatus: 'KILL'}">Kill Job</el-dropdown-item>
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

    <el-dialog title="Job Run Detail" :visible.sync="dialogVisible" width="50%">
      <json-viewer
        :value="jsonData"
        :expand-depth="5"
        copyable
        boxed
        sort
      />
    </el-dialog>
  </div>
</template>

<script>
import { getJobRunPage, killJobRun, getJobRun } from '@/api/job'
import { getStatusList } from '@/api/attr'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import JsonViewer from 'vue-json-viewer'
import { pickerOptions, calcTimeRangeToNow } from '@/components/DatePicker/date-picker'

export default {
  name: 'ProjectList',
  components: { Pagination, JsonViewer },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        NOT_EXIST: 'info',
        SUCCESS: 'success',
        ERROR: 'danger',
        KILLED: 'danger',
        FAILURE: 'danger',
        ABNORMAL: 'danger'
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
      listStatus: [],
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 20,
        id: undefined,
        name: undefined,
        status: undefined,
        flowRunId: undefined,
        jobId: undefined,
        sort: '-id'
      }
    }
  },

  created() {
    var query = this.$route.query
    if (query) {
      this.listQuery.id = query.id
      this.listQuery.flowRunId = query.flowRunId
      this.listQuery.status = query.status
      if (!query.id) {
        this.timeRange = query.timeRange || calcTimeRangeToNow(-1)
      }
    }
    this.getStatus()
    this.getList()
  },

  methods: {
    getStatus() {
      var data = { className: 'ExecutionStatus' }
      getStatusList(data).then((result) => {
        this.listStatus = result
      })
    },
    getList() {
      this.listLoading = true
      this.listQuery.startTime = this.timeRange?.[0]
      this.listQuery.endTime = this.timeRange?.[1]
      getJobRunPage(this.listQuery).then((data) => {
        this.total = data.total
        this.list = data.records.map(item => {
          try {
            // backward compatibility, remove in the future.
            if (typeof item.backInfo === 'string') {
              item.backInfo = JSON.parse(item.backInfo)
            }
          } catch (err) {
            item.backInfo = {}
            console.error('parse backInfo failed', err)
          }
          return item
        })
        setTimeout(() => {
          this.listLoading = false
        }, 200)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleMore(data) {
      const { row, toStatus } = data
      if (toStatus === 'KILL') {
        killJobRun(row.id).then(result => {
          this.getList()
        })
      }
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
.filter-item {
  width: 200px;
  margin-right: 15px;
}

.jv-container .jv-string {
    white-space: nowrap !important;
}
</style>
