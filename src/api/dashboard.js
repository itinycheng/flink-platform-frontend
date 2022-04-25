import request from '@/utils/request'

export function jobRunStatusCount(query) {
  return request({
    url: '/dashboard/jobRunStatusCount',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function jobFlowRunStatusCount(query) {
  return request({
    url: '/dashboard/jobFlowRunStatusCount',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

