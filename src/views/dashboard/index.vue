<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
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
        @change="refresh"
      />
    </div>
    <div class="dashboard-body">
      <el-row style="font-size: 24px; margin: 30px 0">
        <el-col :span="11">JobFlowRun Statistics</el-col>
        <el-col :span="11" :offset="2">JobRun Statistics</el-col>
      </el-row>
      <el-row>
        <el-col :span="11">
          <el-table
            :data="jobFlowRunStatisticsList"
            stripe
            style="width: 100%"
          >
            <el-table-column
              prop="status"
              label="Status"
              min-width="180"
            />
            <el-table-column
              prop="count"
              label="Number"
              width="180"
            >
              <template slot-scope="scope">
                <router-link :to="{name: 'ProjectInstances', params: {status: scope.row.status, timeRange: getTimeRange()}}" class="link-type">
                  {{ scope.row.count }}
                </router-link>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <el-col :span="11" :offset="2">
          <el-table
            :data="jobRunStatisticsList"
            stripe
            style="width: 100%"
          >
            <el-table-column
              prop="status"
              label="Status"
              min-width="180"
            />
            <el-table-column
              prop="count"
              label="Number"
              width="180"
            >
              <template slot-scope="scope">
                <router-link :to="{name: 'ProjectJobRuns', params: {status: scope.row.status, timeRange: getTimeRange()}}" class="link-type">
                  {{ scope.row.count }}
                </router-link>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="11">
          <div ref="jobFlowRunPie" style="width: 100%; height:400px;" />
        </el-col>
        <el-col :span="11" :offset="2">
          <div ref="jobRunPie" style="width: 100%; height:400px;" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { pickerOptions, calcTimeRangeToNow } from '@/components/DatePicker/date-picker'
import { jobRunStatusCount, jobFlowRunStatusCount } from '@/api/dashboard'
import * as echarts from 'echarts'
require('echarts/theme/macarons')

export default {
  name: 'Dashboard',
  data() {
    return {
      // time range
      timeRange: calcTimeRangeToNow(-1),
      pickerOptions: pickerOptions,
      jobRunStatisticsList: [],
      jobFlowRunStatisticsList: []
    }
  },
  mounted() {
    this.refresh()
  },
  methods: {
    refresh() {
      const params = {
        startTime: this.timeRange?.[0],
        endTime: this.timeRange?.[1]
      }
      this.jobRunCount(params)
      this.jobFlowRunCount(params)
    },
    getTimeRange() {
      return [this.timeRange?.[0], this.timeRange?.[1]]
    },
    jobRunCount(params) {
      jobRunStatusCount(params).then((data) => {
        this.jobRunStatisticsList = data
        if (data?.length > 0) {
          this.initChart(this.$refs.jobRunPie, '', data)
        }
      })
    },
    jobFlowRunCount(params) {
      jobFlowRunStatusCount(params).then((data) => {
        this.jobFlowRunStatisticsList = data
        if (data?.length > 0) {
          this.initChart(this.$refs.jobFlowRunPie, '', data)
        }
      })
    },
    initChart(el, title, data) {
      var statusList = data.map((item) => item.status)
      var dataList = data.map((item) => { return { name: item.status, value: item.count } })
      var myChart = echarts.init(el, 'macarons')
      myChart.setOption({
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          bottom: 10,
          left: 'center',
          data: statusList
        },
        series: [
          {
            type: 'pie',
            radius: '65%',
            center: ['50%', '50%'],
            selectedMode: 'single',
            data: dataList,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })
    },
    getStatusColor(status) {

    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-header {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
