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
          v-for="item in statusList"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-select
        v-model="listQuery.type"
        placeholder="Type"
        clearable
        class="filter-item"
      >
        <el-option
          v-for="item in typeList"
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
      <el-button
        v-waves
        type="primary"
        icon="el-icon-search"
        @click.stop="handleSearch"
      >
        Search
      </el-button>
      <el-button type="primary" icon="el-icon-edit" @click.stop="handleCreate">
        Create
      </el-button>
    </div>

    <el-table
      :key="tableKey"
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
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Code" width="100" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Name" min-width="150" align="center">
        <template slot-scope="{ row }">
          <router-link :to="getRoutePath(row)" class="link-type">{{ row.name }}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="Description" min-width="200" align="left">
        <template slot-scope="{ row }">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Crontab" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.cronExpr }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Tag" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.tags }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" width="120" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Notify" width="120" align="center">
        <template slot-scope="{ row }">
          {{ row.alerts? row.alerts.map(item => item.alertId) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="Update Time" min-width="130" align="center">
        <template slot-scope="{ row }">
          {{ row.updateTime }}
        </template>
      </el-table-column>
      <el-table-column label="Create Time" min-width="130" align="center">
        <template slot-scope="{ row }">
          {{ row.createTime }}
        </template>
      </el-table-column>
      <el-table-column
        label="Actions"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="primary" size="mini" :disabled="row.status === 'SCHEDULING'" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-dropdown trigger="click" style="margin: 0 10px;" @command="handleMore">
            <el-button size="mini" type="success">
              Action
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="{row, toStatus: 'ALERT'}">Edit Alert</el-dropdown-item>
              <el-dropdown-item :command="{row, toStatus: 'TAG'}">Edit Tag</el-dropdown-item>
              <el-dropdown-item :command="{row, toStatus: 'COPY'}">Copy Workflow</el-dropdown-item>
              <el-dropdown-item v-if="row.status === 'ONLINE'" :command="{row, toStatus: 'SCHEDULING'}">Scheduling</el-dropdown-item>
              <el-dropdown-item v-if="row.status === 'SCHEDULING'" :command="{row, toStatus: 'STOP_SCHED'}">Stop Sched</el-dropdown-item>
              <el-dropdown-item v-if="row.status === 'OFFLINE'" :command="{row, toStatus: 'ONLINE'}">Online</el-dropdown-item>
              <el-dropdown-item v-if="row.type === 'JOB_FLOW' && row.status === 'ONLINE'" :command="{row, toStatus: 'OFFLINE'}">Offline</el-dropdown-item>
              <el-dropdown-item v-if="row.type === 'JOB_FLOW' && (row.status === 'ONLINE' || row.status === 'SCHEDULING')" :command="{row, toStatus: 'RUN_ONCE'}">Run Once</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button
            v-if="row.status !== 'DELETE'"
            size="mini"
            type="danger"
            :disabled="row.status === 'SCHEDULING'"
            @click="handleDelete(row, $index)"
          >
            Delete
          </el-button>
          <el-button
            v-if="row.status === 'DELETE'"
            size="mini"
            type="danger"
            @click="handlePurge(row, $index)"
          >
            Purge
          </el-button>
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

    <ProjectCreateDialog ref="createDialog" @refreshList="getList" />
    <ScheduleDialog ref="scheduleDialog" @refreshList="getList" />
    <EditAlertDialog ref="editAlertDialog" />
    <EditTagDialog ref="editTagDialog" />
  </div>
</template>

<script>
import { getFlowPage, updateFlow, purgeFlow, copyFlow, stopSchedFlow, runOnceFlow } from '@/api/job-flow'
import { getStatusList } from '@/api/attr'
import { getTagList } from '@/api/tag'
import { rewriteUrl } from '@/utils/url.js'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import ProjectCreateDialog from './create.vue'
import ScheduleDialog from './schedule.vue'
import EditAlertDialog from './alerts.vue'
import EditTagDialog from './tags.vue'

export default {
  name: 'ProjectList',
  components: { Pagination, ProjectCreateDialog, ScheduleDialog, EditAlertDialog, EditTagDialog },
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
      statusList: [],
      tagList: [],
      typeList: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: this.getDefaultQuery()
    }
  },

  watch: {
    '$route.query': 'onRouteQueryChange'
  },

  created() {
    this.getStatus()
    this.getTags()
    this.getTypes()
    this.getList()
  },

  methods: {
    getTags() {
      getTagList().then((result) => {
        this.tagList = result
      })
    },
    getTypes() {
      var data = { className: 'JobFlowType' }
      getStatusList(data).then((result) => {
        this.typeList = result
      })
    },
    getStatus() {
      var data = { className: 'JobFlowStatus' }
      getStatusList(data).then((result) => {
        this.statusList = result
      })
    },
    getList() {
      this.listLoading = true
      getFlowPage(this.listQuery).then((data) => {
        this.list = data.records
        this.total = data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 200)
      })
    },
    getRoutePath(row) {
      return row.type === 'JOB_LIST'
        ? '/project/list/' + row.id
        : (row.status === 'SCHEDULING' ? '/project/flow/show/' : '/project/flow/edit/') + row.id
    },
    handleSearch() {
      this.listQuery.page = 1
      rewriteUrl(this.$router, this.$route, this.listQuery)
    },
    async handleMore(data) {
      const { row, toStatus } = data
      // edit alert info
      if (toStatus === 'ALERT') {
        this.$refs.editAlertDialog.init(row)
        return
      }

      // edit tag
      if (toStatus === 'TAG') {
        this.$refs.editTagDialog.init(row)
        return
      }

      // copy workflow
      if (toStatus === 'COPY') {
        copyFlow(row.id).then(result => {
          this.getList()
        })
        return
      }

      // delete flow
      if (toStatus === 'DELETE_FLOW') {
        return
      }

      // process and status handle
      if (toStatus === row.status) {
        return
      }

      if (toStatus === 'SCHEDULING') {
        this.$refs.scheduleDialog.init(row)
      } else if (toStatus === 'STOP_SCHED') {
        stopSchedFlow(row.id).then(result => {
          this.getList()
        })
      } else if (toStatus === 'RUN_ONCE') {
        runOnceFlow(row.id).then(result => {
          this.$message({
            message: 'Run once Successfully, id=' + result,
            type: 'success'
          })
        })
      } else {
        const newStatus = { id: row.id, status: toStatus }
        updateFlow(newStatus).then(result => {
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
    handleCreate() {
      this.$refs.createDialog.init()
    },
    handleUpdate(row) {
      const rowData = Object.assign({}, row) // copy obj
      this.$refs.createDialog.init(rowData)
    },
    handleDelete(row, index) {
      this.$confirm(`Delete project [${row.id}, ${row.name}] ?`, 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        updateFlow({ id: row.id, status: 'DELETE' })
          .then(result => {
            this.$message({
              message: 'Delete successfully, id=' + result,
              type: 'success'
            })
            this.list.splice(index, 1)
          })
      })
    },
    handlePurge(row, index) {
      this.$confirm(`Purge project [${row.id}, ${row.name}] ?`, 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        purgeFlow(row.id)
          .then(result => {
            this.$message({
              message: 'Purge forever successfully, id=' + result,
              type: 'success'
            })
            this.list.splice(index, 1)
          })
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    onRouteQueryChange() {
      this.initListQuery()
      this.getList()
    },
    initListQuery() {
      var query = this.$route.query
      if (query) {
        this.listQuery = {
          ...this.getDefaultQuery(),
          ...query,
          page: parseInt(query.page) || 1,
          size: parseInt(query.size) || 20
        }
      }
    },
    getDefaultQuery() {
      return {
        page: 1,
        size: 20,
        id: null,
        name: undefined,
        type: undefined,
        status: undefined,
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
