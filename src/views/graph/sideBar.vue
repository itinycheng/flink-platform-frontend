<template>
  <div class="Ec-x6-icon">
    <el-drawer
      title="Toolbar"
      :visible.sync="visible"
      :direction="direction"
      size="100"
      :modal="false"
      :modal-append-to-body="false"
      :show-close="false"
      style="position: absolute; width: 100px; box-sizing: border-box;"
    >
      <section class="listBar" @click.stop="">
        <div class="listBar-cot">
          <div
            v-for="(item, key) in sideMenus"
            :key="key"
            class="drag-cot"
            :class="'icon-' + item.name"
            draggable="true"
            @drag="drag(item)"
            @dragend="dragend(item)"
          />
        </div>

      </section>
    </el-drawer>
  </div>

</template>

<script>
const mouseXY = { x: null, y: null }
import graphConfig from './config'

export default {
  name: 'SideBar',
  data() {
    return {
      visible: true,
      direction: 'ltr',
      sideMenus: graphConfig.sideBarConf
    }
  },
  mounted() {
    document.getElementById('flow-container').addEventListener(
      'dragover',
      function(e) {
        mouseXY.x = e.clientX
        mouseXY.y = e.clientY
      },
      false
    )
  },
  methods: {
    drag: function(item) {
      const parentRect = document
        .getElementById('flow-container')
        .getBoundingClientRect()
      let mouseInGrid = false
      if (
        mouseXY.x > parentRect.left &&
        mouseXY.x < parentRect.right &&
        mouseXY.y > parentRect.top &&
        mouseXY.y < parentRect.bottom
      ) {
        mouseInGrid = true
      }
      if (mouseInGrid === true) {
        console.log('drag node')
      }
    },
    nodeConfig(item, x, y) {
      let config = ''
      switch (item.type) {
        case 'SHELL':
        case 'FLINK':
        case 'SQL':
        case 'CONDITION':
          config = {
            x: x,
            y: y,
            shape: 'dag-node',
            data: item
          }
          break
        default:
          config = {}
      }
      return config
    },
    dragend: function(item) {
      const parentRect = document
        .getElementById('flow-container')
        .getBoundingClientRect()
      let mouseInGrid = false
      if (
        mouseXY.x > parentRect.left &&
        mouseXY.x < parentRect.right &&
        mouseXY.y > parentRect.top &&
        mouseXY.y < parentRect.bottom
      ) {
        mouseInGrid = true
      }
      if (mouseInGrid === true) {
        this.$emit('addNode', this.nodeConfig(item, mouseXY.x, mouseXY.y))
      }
    }
  }
}
</script>

<style scoped>
.Ec-x6-icon ::v-deep .el-drawer__header {
  padding: 0 20px;
  margin-bottom: 0;
  width: 100px;
}

.listBar {
  font-size: 14px;
}

.listBar-cot {
  display: inline-block;
  padding-top: 12px;
  box-sizing: border-box;
  width: 100%;
  text-align: center;
}

.listBar-cot .drag-cot {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
}

.listBar-cot .icon-shell {
  width: 100%;
  height: 60px;
  background: url("../../assets/shell.png") no-repeat center center;
}

.listBar-cot .icon-flink {
  width: 100%;
  height: 60px;
  background: url("../../assets/flink.png") no-repeat center center;
}

.listBar-cot .icon-sql {
  width: 100%;
  height: 60px;
  background: url("../../assets/sql.png") no-repeat center center;
}

.listBar-cot .icon-condition {
  width: 100%;
  height: 60px;
  background: url("../../assets/condition.png") no-repeat center center;
}
</style>
