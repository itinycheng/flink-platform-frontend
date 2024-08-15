<template>
  <el-menu
    v-show="visible"
    class="node-menu"
    active-text-color="#303133"
    :style="{'left':x+'px','top':y+'px'}"
    @select="handleSelect"
  >
    <el-menu-item index="edit">Edit</el-menu-item>
    <el-menu-item v-if="node.data && node.data.id" index="runOnce">RunOnce</el-menu-item>
    <el-menu-item index="delete">Delete</el-menu-item>
  </el-menu>
</template>

<script>
import { runOnceFlow } from '@/api/job-flow'

export default {
  name: 'NodeMenu',
  props: {
    flowId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      x: '',
      y: '',
      node: {},
      visible: false
    }
  },
  mounted() {
  },
  methods: {
    initFn(x, y, node) {
      this.x = parseInt(x) + ''
      this.y = y + ''
      this.node = node
    },

    async handleSelect(key) {
      switch (key) {
        case 'runOnce': {
          if (!this.flowId) {
            this.$message.error(`Unknown job flow, id=${this.flowId}`)
            return
          }
          const jobOrRunId = this.node.getData()?.id
          const jobId = this.node.id
          if (jobOrRunId && jobId) {
            var data = { startJobId: jobId, strategy: 'ONLY_CUR_JOB' }
            await runOnceFlow(this.flowId, data).then((id) => {
              this.$message.success(`Job run once Successfully, id=${id}`)
            })
          }
          break
        }
        case 'edit': {
          this.$parent.$refs.formModel.initFn(this.node)
          this.$parent.$refs.formModel.visible = true
          break
        }
        case 'delete': {
          this.$parent.graph.removeNode(this.node.id)
          break
        }
      }
      this.visible = false
    }
  }
}
</script>

<style scoped>
    .node-menu {
        position: absolute;
        z-index: 112;
        font-size: 14px;
        width: 100px;
    }
    .node-menu .el-menu-item {
      height: 35px;
      line-height: 35px;
    }

    .node-menu .el-menu-item:hover {
        color: #ffffff;
        background-color: #409eff;
    }
</style>
