<template>
  <div class="node" :class="nodeData.status">
    <img :src="nodeData.icon" alt="">
    <span class="label">{{ nodeData.name }}</span>
    <span class="status">
      <img :src="statusImgs[nodeData.status]" alt="">
    </span>
  </div>
</template>

<script>
import graphConfig from './config'

export default {
  name: 'NodeItem',
  inject: ['getGraph', 'getNode'],
  data() {
    return {
      nodeData: {},
      statusImgs: graphConfig.nodeStateImgs
    }
  },
  mounted() {
    const self = this
    const node = this.getNode()
    this.nodeData = this.display(node.getData())
    // watch data change event and refresh node display
    node.on('change:data', ({ current }) => {
      self.nodeData = self.display(current)
    })
  },
  methods: {
    display(data) {
      return { ...data,
        name: this.displayName(data.name),
        status: this.displayStatus(data.status)
      }
    },
    displayName(name) {
      if (name && name.length > 10) {
        return name.substr(0, 11) + '...'
      } else {
        return name
      }
    },
    displayStatus(status) {
      switch (status) {
        case 'CREATED':
        case 'SUBMITTED':
        case 'RUNNING':
          return 'running'
        case 'SUCCESS':
          return 'success'
        case 'FAILURE':
        case 'KILLED':
        case 'ABNORMAL':
        case 'NOT_EXIST':
        case 'ERROR':
          return 'failed'
        default:
          return 'default'
      }
    }
  }
}
</script>
<style xml:lang="scss" scoped>
    .node {
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
        background-color: #fff;
        border: 1px solid #c2c8d5;
        border-left: 4px solid #5F95FF;
        border-radius: 4px;
        box-shadow: 0 2px 5px 1px rgba(0, 0, 0, 0.06);
    }

    .node img {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        margin-left: 8px;
    }

    .node .label {
        display: inline-block;
        flex-shrink: 0;
        width: 104px;
        margin-left: 8px;
        color: #666;
        font-size: 16px;
    }

    .node .status {
        flex-shrink: 0;
    }

    .node.success {
        border-left: 4px solid #52c41a;
    }

    .node.failed {
        border-left: 4px solid #ff4d4f;
    }

    .node.running .status img {
        animation: spin 1s linear infinite;
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
</style>
