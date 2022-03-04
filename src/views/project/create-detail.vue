<template>
  <div id="coverCot" style="width: 100%; height: 100vh; overflow: hidden">
    <section class="section-cot" style="width: 100%; height: 100%;">
      <div id="flow-container" @click.stop="hideFn">
        <header>
          <el-tooltip class="item" effect="dark" content="项目" placement="bottom">
            <i class="el-icon-menu" @click="showDrawerFn()" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="长按shift多选" placement="bottom">
            <i class="el-icon-crop" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="放大" placement="bottom">
            <i class="el-icon-zoom-in" @click="zoomFn(0.2)" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="缩小" placement="bottom">
            <i class="el-icon-zoom-out" @click="zoomFn(-0.2)" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="适应屏幕" placement="bottom">
            <i class="el-icon-full-screen" @click="centerFn" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="执行" placement="bottom">
            <i class="el-icon-video-play" @click="runOnceFn()" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="保存" placement="bottom">
            <i class="el-icon-upload" @click="saveFn()" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="加载保存页面" placement="bottom">
            <i class="el-icon-link" @click="loadFn()" />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="是否禁用" placement="bottom">
            <i :class="{'el-icon-lock':isLock, 'el-icon-unlock':!isLock}" @click="lockFn()" />
          </el-tooltip>
        </header>
        <div id="draw-cot" />
        <SideBar ref="drawer" @addNode="addNode" />
        <NodeMenu ref="nodeMenu" />
        <EdgeMenu ref="edgeMenu" />
      </div>
    </section>

    <FormModel ref="formModel" />
  </div>
</template>

<script>
import { Graph, Path } from '@antv/x6'
import { getJobByIds } from '@/api/job.js'
import { getFlow, updateGraph, runOnceFlow } from '@/api/job-flow.js'

import '@antv/x6-vue-shape'

import DataJson from '@/data'
import NodeMenu from '@/components/graph/nodeMenu.vue'
import EdgeMenu from '@/components/graph/edgeMenu.vue'
import SideBar from '@/components/graph/sideBar.vue'
import nodeitem from '@/components/graph/nodeItem.vue'
import graphConfig from '@/components/graph/config'
import FormModel from '../form/formModel.vue'

const nodeStatusList = []

export default {
  name: 'ProjectCreateDetail',
  components: { NodeMenu, EdgeMenu, SideBar, FormModel },
  data() {
    return {
      graph: '',
      timer: '',
      isLock: false,
      sideMenus: graphConfig.sideBarConf
    }
  },
  mounted() {
    this.initGraph()
    this.keyBindFn()
    this.initDagFn()
  },
  methods: {
    hideFn() {
      this.$refs.nodeMenu.visible = false
      this.$refs.edgeMenu.visible = false
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
          this.$refs.nodeMenu.initFn(p.x, p.y, node)
        })
      })

      graph.on('node:change:data', ({ node }) => {
        const edges = graph.getIncomingEdges(node)
        const { status } = node.getData()
          edges?.forEach((edge) => {
            if (status === 'running') {
              edge.attr('line/strokeDasharray', 5)
              edge.attr('line/style/animation', 'running-line 30s infinite linear')
            } else {
              edge.attr('line/strokeDasharray', '')
              edge.attr('line/style/animation', '')
            }
          })
      })
    },
    async initDagFn() {
      this.timer && clearTimeout(this.timer)
      this.drawDag(await this.genDagData() || DataJson)
      this.showNodeStatus(Object.assign([], nodeStatusList))
      this.graph.centerContent()
    },
    async genDagData() {
      const flowId = this.$route.params.id
      if (!flowId) {
        return null
      }

      const itemData = await getFlow(flowId)
      if (!itemData || !itemData.flow) {
        return null
      }

      const flowData = itemData.flow
      const nodeLayouts = flowData.nodeLayouts

      const data = []
      const jobs = {}
      const ids = flowData.vertices?.map(vertex => vertex.id)
      await getJobByIds(ids).then(result => {
          result?.forEach((item) => {
            jobs[item.id] = item
          })
      })

      flowData.vertices?.forEach(vertex => {
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
            type: nodeType
          }
        })
      })
      flowData.edges?.forEach(edge => {
        data.push({
          id: edge.fromVId + '-' + edge.toVId,
          shape: 'dag-edge',
          source: { cell: edge.fromVId },
          target: { cell: edge.toVId },
          data: { 'status': edge.expectStatus },
          labels: [{
            'attrs': {
              text: { text: edge.expectStatus, fontSize: 14 },
              rect: { fill: 'none' }
            }
          }]
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
      updateGraph({ id: this.$route.params.id, flow: graphJsonData })
        .then(result => {
          this.$notify({
            title: 'Success',
            message: 'Flow Updated, id=' + result,
            type: 'success'
          })
          this.$router.push('/project/list')
        })
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
      const flowId = this.$route.params.id
      runOnceFlow(flowId).then(result => {
        this.$notify({
          title: 'Success',
          message: 'Flow Run Once, id=' + result,
          type: 'success'
        })
      })
    },
    loadFn() {
      this.timer && clearTimeout(this.timer)
      const x6Json = JSON.parse(localStorage.getItem('x6Json'))

      this.initDagFn(x6Json.cells)
    },
    lockFn() {
      this.isLock = !this.isLock
      if (this.isLock) {
        this.graph.enablePanning()
        this.graph.enableKeyboard()
      } else {
        this.graph.disablePanning()
        this.graph.disableKeyboard()
      }
    },

    showDrawerFn() {
      this.$refs.drawer.visible = !this.$refs.drawer.visible
    },
    addNode(option) {
      const p = this.graph.pageToLocal(option.x, option.y)
      this.graph.addNode(Object.assign({}, option, p))
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
