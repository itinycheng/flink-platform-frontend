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
          v-for="item in listStatus"
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
          <router-link
            :to="'/project/instance/' + row.id"
            class="link-type"
          >{{ row.id }}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="Flow Id" min-width="100" align="left">
        <template slot-scope="{ row }">
          <span>{{ row.flowId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Name" min-width="350" align="center">
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
      <el-table-column label="Priority" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.priority }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" width="120" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
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
        <el-button type="success" size="mini"> Action </el-button>
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
import { getFlowRunPage } from '@/api/job-flow'
import { getStatusList } from '@/api/attr'
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
        OFFLINE: 'info',
        ONLINE: '',
        SCHEDULING: 'success',
        DELETE: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      // time range
      timeRange: calcTimeRangeToNow(-1),
      pickerOptions: pickerOptions,
      // list
      listStatus: [],
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 20,
        name: undefined,
        status: undefined,
        startTime: undefined,
        endTime: undefined,
        sort: '-id'
      }
    }
  },

  created() {
    if (this.$route.params?.status) {
      this.listQuery.status = this.$route.params.status
      this.timeRange = this.$route.params.timeRange
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
      getFlowRunPage(this.listQuery).then((data) => {
        this.list = data.records
        this.total = data.total

        setTimeout(() => {
          this.listLoading = false
        }, 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
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
