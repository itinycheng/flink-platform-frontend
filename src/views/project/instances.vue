<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px">
      <el-input
        v-model="listQuery.id"
        type="number"
        placeholder="ID"
        class="filter-item"
        @keyup.enter.native="handleSearch"
      />
      <el-input
        v-model="listQuery.name"
        placeholder="Name"
        class="filter-item"
        @keyup.enter.native="handleSearch"
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
      <el-select
        v-model="listQuery.tag"
        placeholder="Tag"
        clearable
        class="filter-item"
      >
        <el-option
          v-for="item in tagList"
          :key="item.id"
          :label="item.name"
          :value="item.code"
        />
      </el-select>
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
        @click.stop="handleSearch"
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
          <router-link :to="{name: 'ProjectJobRuns', query: {flowRunId: row.id, timeRange: timeRange}}" class="link-type">
            {{ row.id }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="Flow Id" min-width="100" align="left">
        <template slot-scope="{ row }">
          <span>{{ row.flowId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Name" min-width="300" align="center">
        <template slot-scope="{ row }">
          <router-link
            :to="'/project/flow/instance/' + row.id"
            class="link-type"
          >{{ row.name }}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="Host" min-width="120" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.host }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Cron Expr" min-width="120" align="center">
        <template slot-scope="{ row }">
          {{ row.cronExpr }}
        </template>
      </el-table-column>
      <el-table-column label="Tags" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.tags }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" width="160" align="center">
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
      <el-table-column label="Start Time" min-width="160" align="center">
        <template slot-scope="{ row }">
          {{ row.startTime }}
        </template>
      </el-table-column>
      <el-table-column label="Stop Time" min-width="160" align="center">
        <template slot-scope="{ row }">
          {{ row.endTime }}
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
              <el-dropdown-item :command="{row, toStatus: 'KILL'}">Kill Workflow</el-dropdown-item>
              <el-dropdown-item :command="{row, toStatus: 'KILLED'}">Set KILLED</el-dropdown-item>
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
  </div>
</template>

<script>
import { getFlowRunPage, updateFlowRun, killFlowRun } from '@/api/job-flow'
import { getStatusList } from '@/api/attr'
import { getTagList } from '@/api/tag'
import { rewriteUrl } from '@/utils/url.js'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { pickerOptions, calcTimeRangeToNow } from '@/components/DatePicker/date-picker'

export default {
  name: 'ProjectList',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        NOT_EXIST: 'info',
        SUCCESS: 'success',
        ERROR: 'danger',
        KILLED: 'danger',
        FAILURE: 'danger',
        ABNORMAL: 'danger',
        EXPECTED_FAILURE: 'warning'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      timeRange: calcTimeRangeToNow(-1),
      pickerOptions: pickerOptions,
      listStatus: [],
      tagList: [],
      list: null,
      total: 0,
      listLoading: true,
      listQuery: this.getDefaultQuery()
    }
  },
  watch: {
    '$route.query': {
      handler: 'updateQueryAndGetList',
      immediate: false
    }
  },
  async created() {
    await this.getStatus()
    await this.getTags()
    this.updateQueryAndGetList()
  },

  methods: {
    getTags() {
      getTagList().then((result) => {
        this.tagList = result
      })
    },
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
      getFlowRunPage(this.listQuery).then((data) => {
        this.list = data.records
        this.total = data.total

        setTimeout(() => {
          this.listLoading = false
        }, 200)
      })
    },
    handleSearch() {
      this.listQuery.page = 1
      rewriteUrl(this.$router, this.$route, this.listQuery)
    },
    handleMore(data) {
      const { row, toStatus } = data
      if (toStatus === 'KILL') {
        killFlowRun(row.id).then(result => {
          this.getList()
        })
      } else if (toStatus === 'KILLED') {
        const newStatus = { id: row.id, status: toStatus }
        updateFlowRun(newStatus).then(result => {
          row.status = toStatus
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
      this.handleSearch()
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    updateQueryAndGetList() {
      this.initListQuery()
      this.getList()
    },
    initListQuery() {
      var query = this.$route.query
      if (query) {
        const { timeRange, ...restQuery } = query
        this.listQuery = {
          ...this.getDefaultQuery(),
          ...restQuery,
          page: parseInt(query.page) || 1,
          size: parseInt(query.size) || 20
        }

        this.timeRange = timeRange || this.timeRange
      }
    },
    getDefaultQuery() {
      return {
        page: 1,
        size: 20,
        id: null,
        name: undefined,
        status: undefined,
        startTime: undefined,
        endTime: undefined,
        sort: '-id'
      }
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
