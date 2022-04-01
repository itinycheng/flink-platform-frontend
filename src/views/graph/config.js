import flinkImg from '@/assets/flink.png'
import shellImg from '@/assets/shell.png'
import sqlImg from '@/assets/sql.png'
import operation from '@/assets/operation.png'
import statusRunning from '@/assets/running.png'
import statusFailed from '@/assets/failed.png'
import statusSuccess from '@/assets/success.png'

const graphConfig = {
  sideBarConf: {
    'SHELL': {
      id: null,
      name: 'shell',
      type: 'SHELL',
      icon: shellImg,
      status: 'default',
      precondition: 'AND'
    },
    'FLINK': {
      id: null,
      name: 'flink',
      type: 'FLINK',
      icon: flinkImg,
      status: 'default',
      precondition: 'AND'
    },
    'SQL': {
      id: null,
      name: 'sql',
      type: 'SQL',
      icon: sqlImg,
      status: 'default',
      precondition: 'AND'
    }
  },

  nodeStateImgs: {
    default: operation,
    success: statusSuccess,
    failed: statusFailed,
    running: statusRunning
  },

  nodePorts: {
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
      right: {
        position: 'right',
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
      },
      left: {
        position: 'left',
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
        group: 'top'
      }, {
        group: 'bottom'
      }, {
        group: 'left'
      }, {
        group: 'right'
      }]
  }
}

export default graphConfig
