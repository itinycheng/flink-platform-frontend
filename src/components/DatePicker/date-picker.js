
import moment from 'moment'

export const pickerOptions = {
  shortcuts: [{
    text: 'Last week',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: 'Last month',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: 'Last 3 months',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      picker.$emit('pick', [start, end])
    }
  }]
}

export function calcTimeRangeToNow(offset) {
  if (!offset) {
    offset = -1
  }

  const start = new Date().getTime() + 3600 * 1000 * 24 * offset
  const end = new Date()
  return [moment(start).format('YYYY-MM-DD HH:mm:ss'),
    moment(end).format('YYYY-MM-DD 23:59:59')]
}
