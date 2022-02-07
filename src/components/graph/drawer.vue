<template>
  <div class="Ec-x6-icon">
    <el-drawer
      title="工具栏"
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
            v-for="item in sideBarList"
            :key="item.name"
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
import sideBarConf from './config'

export default {
  name: 'Drawer',
  data() {
    return {
      visible: true,
      direction: 'ltr',
      sideBarList: sideBarConf
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
      }
    },
    nodeConfig(item, x, y) {
      let config = ''
      switch (item.type) {
        case 'SHELL':
          config = {
            x: x,
            y: y,
            width: 180,
            height: 40,
            shape: 'dag-shell',
            data: item,
            ports: {
              groups: {
                bottom: {
                  position: 'bottom',
                  attrs: {
                    circle: {
                      r: 4,
                      magnet: true,
                      stroke: '#C2C8D5',
                      strokeWidth: 1,
                      fill: '#fff'
                    }
                  }
                }
              },
              items: [
                {
                  id: 'port2',
                  group: 'bottom' // 指定分组名称
                }
              ]
            }
          }
          break
        case 'FLINK':
          config = {
            x: x,
            y: y,
            width: 180,
            height: 40,
            shape: 'dag-flink',
            data: item,
            ports: {
              groups: {
                top: {
                  position: 'top',
                  attrs: {
                    circle: {
                      r: 4,
                      magnet: true,
                      stroke: '#C2C8D5',
                      strokeWidth: 1,
                      fill: '#fff'
                    }
                  }
                },
                bottom: {
                  position: 'bottom',
                  attrs: {
                    circle: {
                      r: 4,
                      magnet: true,
                      stroke: '#C2C8D5',
                      strokeWidth: 1,
                      fill: '#fff'
                    }
                  }
                }
              },
              items: [
                {
                  id: 'port1',
                  group: 'top' // 指定分组名称
                },
                {
                  id: 'port2',
                  group: 'bottom' // 指定分组名称
                }
              ]
            }
          }
          break
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
  background: url("../../assets/toolbar_shell.png") no-repeat 50% 50%;
}

.listBar-cot .icon-flink {
  width: 100%;
  height: 60px;
  background: url("../../assets/toolbar_flink.png") no-repeat 50% 50%;
}
</style>
