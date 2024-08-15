<template>
  <el-drawer
    title="Job List"
    :visible.sync="visible"
    :destroy-on-close="true"
    :wrapper-closable="false"
    :modal="true"
    :modal-append-to-body="true"
    size="40%"
  >
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
          <el-button type="text">{{ row.name }}</el-button>
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
      <el-table-column
        label="Actions"
        align="center"
        width="120"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-dropdown trigger="click" :disabled="disabled" style="margin: 0 10px;" @command="handleAction">
            <el-button type="success" size="mini"> Action </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="{row, toStatus: 'APPEND'}">Append</el-dropdown-item>
              <el-dropdown-item :command="{row, toStatus: 'PURGE'}">Purge</el-dropdown-item>
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
  </el-drawer>
</template>

<script>
import { getJobPage, purgeJob } from '@/api/job'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import graphConfig from './config'
import { getNodeClassification } from '@/api/attr.js'

export default {
  name: 'ProjectList',
  components: { Pagination },
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
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 20,
        flowId: undefined,
        excludeJobsInFlow: true,
        sort: '-id'
      }
    }
  },

  created() {
  },

  methods: {
    init(data = {}) {
      if (this.disabled) {
        return
      }

      this.listQuery.flowId = data.id
      this.getList()
      this.visible = true
    },
    getList() {
      this.listLoading = true
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
        case 'APPEND':
          this.handleAppend(row)
          break
        case 'PURGE':
          this.handlePurge(row)
          break
      }
    },
    async handleAppend(job) {
      const nodeType = await getNodeClassification(job.type)
      const defaultConf = graphConfig.sideBarConf[nodeType]
      this.$emit('addNode', {
        id: job.id,
        x: 400,
        y: 300,
        shape: 'dag-node',
        data: {
          ...defaultConf,
          id: job.id,
          name: job.name,
          status: job.status,
          type: nodeType,
          jType: 'job',
          precondition: 'AND'
        }
      })
    },
    handlePurge(row) {
      this.$confirm(`Purge job [${row.id}, ${row.name}] completely?`, 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        purgeJob(row.id)
          .then(result => {
            this.$message({
              message: 'Purge successfully, job id=' + result,
              type: 'success'
            })
            this.getList()
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
