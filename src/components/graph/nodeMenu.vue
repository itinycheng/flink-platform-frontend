<template>
  <el-menu
    v-show="visible"
    class="node-menu"
    active-text-color="#303133"
    :style="{'left':x+'px','top':y+'px'}"
    @select="handleSelect"
  >
    <el-menu-item index="edit">Edit</el-menu-item>
    <el-menu-item index="delete">Delete</el-menu-item>
  </el-menu>
</template>

<script>

export default {
  name: 'NodeMenu',
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

    handleSelect(key, keyPath) {
      switch (key) {
        case 'edit':
          this.$parent.$refs.formModel.visible = true
          this.$parent.$refs.formModel.initFn(this.node)
          break
        case 'delete':
          this.$parent.graph.removeNode(this.node.id)
          break
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
