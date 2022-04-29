import request from '@/utils/request'

export function syncExec(data) {
  return request({
    url: `/reactive/sync`,
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function asyncExec(data) {
  return request({
    url: `/reactive/async`,
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

