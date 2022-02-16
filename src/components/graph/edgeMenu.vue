<template>
  <el-menu
    v-show="visible"
    class="edge-menu"
    active-text-color="#303133"
    :style="{'left':x+'px','top':y+'px'}"
    @select="handleSelect"
  >
    <el-menu-item v-for="menuItem in menuList" :key="menuItem" :index="menuItem"> {{ menuItem }}</el-menu-item>
  </el-menu>
</template>

<script>

export default {
  name: 'EdgeMenu',
  data() {
    return {
      x: '',
      y: '',
      edge: {},
      visible: false,
      menuList: ['SUCCESS', 'FAILED', 'RUNNING', 'DELETE']
    }
  },
  mounted() {
  },
  methods: {
    initFn(x, y, edge) {
      this.x = parseInt(x) + ''
      this.y = y + ''
      this.edge = edge
    },

    handleSelect(key, keyPath) {
      if (key === 'DELETE') {
        this.$parent.graph.removeEdge(this.edge.id)
      } else {
        const label = {
          attrs: {
            text: { text: key, fontSize: 14 },
            rect: { fill: 'none' }
          }
        }
        this.edge.setLabels(label)
        this.edge.setData({ 'status': key })
      }
      this.visible = false
    }
  }
}
</script>

<style scoped>
    .edge-menu {
        position: absolute;
        z-index: 112;
        font-size: 14px;
        width: 100px;
    }

    .edge-menu .el-menu-item {
      height: 30px;
      line-height: 30px;
    }

    .edge-menu .el-menu-item:hover {
        color: #ffffff;
        background-color: #409eff;
    }
</style>
