<template>
  <div id="coverCot" style="width: 100%; height: 100vh; overflow: hidden">
    <section class="section-cot" style="width: 100%; height: 100%">
      <div id="flow-container" @click.stop="hideFn()">
        <header>
          <el-tooltip
            class="item"
            effect="dark"
            content="Toolbar"
            placement="bottom"
          >
            <i class="el-icon-menu" @click="showDrawerFn()" />
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="Edit params"
            placement="bottom"
          >
            <i class="el-icon-tickets" @click="openParamDialog()" />
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="Jobs"
            placement="bottom"
          >
            <i class="el-icon-notebook-1" @click="showJobList()" />
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="Show all jobs of this workflow"
            placement="bottom"
          >
            <i class="el-icon-crop" />
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="Zoom in"
            placement="bottom"
          >
            <i class="el-icon-zoom-in" @click="zoomFn(0.2)" />
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="Zoom out"
            placement="bottom"
          >
            <i class="el-icon-zoom-out" @click="zoomFn(-0.2)" />
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="Center graph"
            placement="bottom"
          >
            <i class="el-icon-full-screen" @click="centerFn()" />
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="Run once"
            placement="bottom"
          >
            <i class="el-icon-video-play" @click="runOnceFn()" />
          </el-tooltip>
          <el-tooltip
            v-if="!isLock"
            class="item"
            effect="dark"
            content="Save"
            placement="bottom"
          >
            <i class="el-icon-upload" @click="saveFn()" />
          </el-tooltip>
          <!-- <el-tooltip
            class="item"
            effect="dark"
            content="加载保存页面"
            placement="bottom"
          >
            <i class="el-icon-link" @click="loadFn()" />
          </el-tooltip> -->
          <el-tooltip
            class="item"
            effect="dark"
            content="Is lock"
            placement="bottom"
          >
            <i
              :class="{ 'el-icon-lock': isLock, 'el-icon-unlock': !isLock }"
              @click="lockFn()"
            />
          </el-tooltip>
        </header>
        <div id="draw-cot" />
        <SideBar ref="drawer" @addNode="addNode" />
        <NodeMenu ref="nodeMenu" :flow-id="id" />
        <EdgeMenu ref="edgeMenu" />
      </div>
    </section>

    <FormModel ref="formModel" :disabled="isLock" />
    <EditParamDialog ref="editParamDialog" :disabled="isLock" />
    <JobList ref="jobList" :disabled="isLock" @addNode="addNode" />
  </div>
</template>

<script>
import { Graph, Path, DataUri } from '@antv/x6'
import { getJobOrJobRunList } from '@/api/job.js'
import { getFlowOrFlowRun, updateGraph, runOnceFlow } from '@/api/job-flow.js'

import '@antv/x6-vue-shape'

import NodeMenu from './nodeMenu.vue'
import EdgeMenu from './edgeMenu.vue'
import SideBar from './sideBar.vue'
import nodeitem from './nodeItem.vue'
import graphConfig from './config'
import FormModel from '../form/formModel.vue'
import EditParamDialog from './jobParams.vue'
import JobList from './graphJobList.vue'

export default {
  name: 'ProjectCreateDetail',
  components: { NodeMenu, EdgeMenu, SideBar, FormModel, EditParamDialog, JobList },
  data() {
    return {
      id: null,
      type: '',
      graph: '',
      isLock: true,
      sideMenus: graphConfig.sideBarConf
    }
  },
  mounted() {
    this.initData()
    this.initGraph()
    this.keyBindFn()
    this.initDagFn()
  },
  beforeDestroy() {},
  methods: {
    hideFn() {
      this.$refs.nodeMenu.visible = false
      this.$refs.edgeMenu.visible = false
    },
    initData() {
      this.id = this.$route.params.id
      this.type = this.$route.params.type
      this.isLock = this.type !== 'edit'
    },
    initGraph() {
      Graph.registerNode(
        'dag-node',
        {
          inherit: 'vue-shape',
          width: 180,
          height: 36,
          component: {
            template: `<nodeitem />`,
            components: {
              nodeitem
            }
          },
          ports: { ...graphConfig.nodePorts }
        },
        true
      )

      Graph.registerEdge(
        'dag-edge',
        {
          inherit: 'edge',
          attrs: {
            line: {
              stroke: '#C2C8D5',
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8,
                d: 'M 6 -3 0 0 6 3 Z'
              }
            }
          }
        },
        true
      )

      Graph.registerConnector(
        'algo-connector',
        (s, e) => {
          const offset = 4
          const deltaY = Math.abs(e.y - s.y)
          const control = Math.floor((deltaY / 3) * 2)

          const v1 = { x: s.x, y: s.y + offset + control }
          const v2 = { x: e.x, y: e.y - offset - control }

          return Path.normalize(
            `M ${s.x} ${s.y}
           L ${s.x} ${s.y + offset}
           C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${e.x} ${e.y - offset}
           L ${e.x} ${e.y}
          `
          )
        },
        true
      )

      const graph = new Graph({
        grid: {
          size: 10,
          visible: true,
          type: 'dot',
          args: {
            color: '#a05410',
            thickness: 1
          }
        },
        background: {
          color: '#fffbe6'
        },
        container: document.getElementById('draw-cot'),
        panning: {
          enabled: true,
          eventTypes: ['leftMouseDown', 'mouseWheel']
        },
        mousewheel: {
          enabled: true,
          modifiers: 'ctrl',
          factor: 1.1,
          maxScale: 1.5,
          minScale: 0.5
        },
        highlighting: {
          magnetAdsorbed: {
            name: 'stroke',
            args: {
              attrs: {
                fill: '#fff',
                stroke: '#31d0c6',
                strokeWidth: 4
              }
            }
          }
        },
        connecting: {
          snap: true,
          allowBlank: false,
          allowMulti: false,
          allowLoop: false,
          highlight: true,
          connector: 'algo-connector',
          connectionPoint: 'anchor',
          anchor: 'center',
          validateMagnet({ magnet }) {
            // 限制连线配置
            return true
          },
          createEdge() {
            return graph.createEdge({
              shape: 'dag-edge',
              zIndex: -1
            })
          }
        },
        selecting: {
          enabled: true,
          multiple: true,
          rubberEdge: true,
          rubberNode: true,
          modifiers: 'shift',
          rubberband: true
        },
        keyboard: true,
        clipboard: true,
        history: true
      })
      this.graph = graph

      graph.on('edge:contextmenu', ({ e, x, y, edge, view }) => {
        this.$refs.edgeMenu.visible = true
        this.$nextTick(() => {
          this.$refs.edgeMenu.initFn(e.offsetX, e.offsetY, edge)
        })
      })

      graph.on('node:contextmenu', ({ e, x, y, node, view }) => {
        this.$refs.nodeMenu.visible = true
        this.$nextTick(() => {
          const p = graph.localToPage(x, y)
          this.$refs.nodeMenu.initFn(p.x - 200, p.y - 50, node)
        })
      })

      graph.on('node:change:data', ({ node }) => {
        const edges = graph.getIncomingEdges(node)
        const { status } = node.getData()
        edges?.forEach((edge) => {
          if (status === 'running') {
            edge.attr('line/strokeDasharray', 5)
            edge.attr(
              'line/style/animation',
              'running-line 30s infinite linear'
            )
          } else {
            edge.attr('line/strokeDasharray', '')
            edge.attr('line/style/animation', '')
          }
        })
      })
    },
    async initDagFn() {
      const nodeStatusList = []
      this.drawDag((await this.genDagData()) || [])
      this.showNodeStatus(Object.assign([], nodeStatusList))
      this.graph.centerContent()
      if (this.isLock) {
        this.graph.freeze()
        this.graph.disablePanning()
        this.graph.disableKeyboard()
      }
    },
    async genDagData() {
      if (!this.id) {
        return null
      }

      const itemData = await getFlowOrFlowRun(this.id, this.type)
      if (!itemData || !itemData.flow) {
        return null
      }

      const flowData = itemData.flow
      const nodeLayouts = flowData.nodeLayouts

      const data = []
      const jobs = {}
      const ids = flowData.vertices?.map((vertex) => vertex.id)
      await getJobOrJobRunList(this.id, this.type, ids).then((result) => {
        result?.forEach((item) => {
          if (item.jobId) {
            item.jType = 'jobRun'
            jobs[item.jobId] = item
          } else {
            item.jType = 'job'
            jobs[item.id] = item
          }
        })
      })

      flowData.vertices?.forEach((vertex) => {
        const nodeLayout = nodeLayouts[vertex.id]
        const nodeType = nodeLayout?.type
        const job = jobs[vertex.id]
        const defaultConf = graphConfig.sideBarConf[nodeType]
        data.push({
          id: vertex.id,
          x: nodeLayout?.x,
          y: nodeLayout?.y,
          shape: 'dag-node',
          data: {
            ...defaultConf,
            id: job.id,
            name: job.name,
            status: job.status,
            type: nodeType,
            jType: job.jType,
            precondition: vertex.precondition
          }
        })
      })
      flowData.edges?.forEach((edge) => {
        data.push({
          id: edge.fromVId + '-' + edge.toVId,
          shape: 'dag-edge',
          source: { cell: edge.fromVId },
          target: { cell: edge.toVId },
          data: { status: edge.expectStatus },
          labels: [
            {
              attrs: {
                text: { text: edge.expectStatus, fontSize: 14 },
                rect: { fill: 'none' }
              }
            }
          ]
        })
      })
      return data
    },
    drawDag(data = []) {
      const cells = []
      data.forEach((item) => {
        if (item.shape === 'dag-edge') {
          cells.push(this.graph.createEdge(item))
        } else {
          delete item.component
          cells.push(this.graph.createNode(item))
        }
      })
      this.graph.resetCells(cells)
    },

    async showNodeStatus(statusList) {
      const status = statusList.shift()
      status?.forEach((item) => {
        const { id, status } = item
        const node = this.graph.getCellById(id)
        const data = node.getData()
        node.setData({
          ...data,
          status: status
        })
      })
      this.timer = setTimeout(() => {
        this.showNodeStatus(statusList)
      }, 3000)
    },

    zoomFn(num) {
      this.graph.zoom(num)
    },
    centerFn() {
      const num = 1 - this.graph.zoom()
      num > 1 ? this.graph.zoom(num * -1) : this.graph.zoom(num)
      this.graph.centerContent()
    },
    saveFn() {
      const edgeDataArr = this.graph.getEdges().map((edge) => {
        const edgeData = edge.getData()
        const sourceData = edge.getSourceNode().getData()
        const targetData = edge.getTargetNode().getData()
        return {
          fromVId: sourceData?.id,
          toVId: targetData?.id,
          expectStatus: edgeData?.status
        }
      })
      const nodeDataArr = []
      const nodeLayouts = {}
      this.graph.getNodes().map((node) => {
        const nodeXY = node.position()
        const nodeData = node.getData()
        nodeDataArr.push({
          id: nodeData?.id,
          jobId: nodeData?.id,
          precondition: nodeData?.precondition
        })
        nodeLayouts[nodeData?.id] = {
          x: nodeXY.x,
          y: nodeXY.y,
          type: nodeData?.type
        }
      })
      const graphJsonData = {
        vertices: nodeDataArr,
        edges: edgeDataArr,
        nodeLayouts: nodeLayouts
      }
      updateGraph({ id: this.id, flow: graphJsonData }).then(
        (result) => {
          this.$message({
            message: 'Flow Updated, id=' + result,
            type: 'success'
          })
          this.$router.push('/project/list')
        }
      )
    },
    keyBindFn() {
      // copy cut paste
      this.graph.bindKey(['meta+c', 'ctrl+c'], () => {
        const cells = this.graph.getSelectedCells()
        if (cells.length) {
          this.graph.copy(cells)
        }
        return false
      })
      this.graph.bindKey(['meta+x', 'ctrl+x'], () => {
        const cells = this.graph.getSelectedCells()
        if (cells.length) {
          this.graph.cut(cells)
        }
        return false
      })
      this.graph.bindKey(['meta+v', 'ctrl+v'], () => {
        if (!this.graph.isClipboardEmpty()) {
          const cells = this.graph.paste({ offset: 32 })
          this.graph.cleanSelection()
          this.graph.select(cells)
        }
        return false
      })
      // undo redo
      this.graph.bindKey(['meta+z', 'ctrl+z'], () => {
        if (this.graph.history.canUndo()) {
          this.graph.history.undo()
        }
        return false
      })
    },
    runOnceFn() {
      if (this.type === 'instance') {
        return
      }

      runOnceFlow(this.id).then((result) => {
        this.$message.success(`JobFlow Run Once, id=${result}`)
      })
    },
    graphToPng() {
      this.graph.toPNG((dataUri) => {
        DataUri.downloadDataUri(dataUri, 'graph.png')
      }, {
        padding: {
          top: 20,
          right: 30,
          bottom: 40,
          left: 50
        }
      })
    },
    showDrawerFn() {
      this.$refs.drawer.visible = !this.$refs.drawer.visible
    },
    addNode(option) {
      const p = this.graph.pageToLocal(option.x, option.y)
      this.graph.addNode(Object.assign({}, option, p))
    },
    openParamDialog() {
      const data = { id: this.id, type: this.type }
      this.$refs.editParamDialog.init(data)
    },
    showJobList() {
      const data = { id: this.id, type: this.type }
      this.$refs.jobList.init(data)
    }
  }
}
</script>

<style>
#coverCot {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#coverCot header {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding-right: 20px;
  height: 50px;
}

#coverCot header i {
  margin: 8px;
  font-size: 30px;
}

.my-selecting {
  border: 1px solid red;
  display: block;
  z-index: 0;
}

@keyframes running-line {
  to {
    stroke-dashoffset: -1000;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.x6-node-selected .node {
  border-color: #1890ff;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #d4e8fe;
}

.x6-node-selected .node.success {
  border-color: #52c41a;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #ccecc0;
}

.x6-node-selected .node.failed {
  border-color: #ff4d4f;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #fedcdc;
}

.x6-edge:hover path:nth-child(2) {
  stroke: #1890ff;
  stroke-width: 1px;
}

.x6-edge-selected path:nth-child(2) {
  stroke: #1890ff;
  stroke-width: 1.5px !important;
}

.section-cot {
  display: flex;
}

.section-cot #flow-container {
  position: relative;
  flex: 1;
}

.section-cot #flow-container #draw-cot {
  width: 100%;
  height: 100%;
}

::-webkit-scrollbar {
  width: 0;
}
</style>
