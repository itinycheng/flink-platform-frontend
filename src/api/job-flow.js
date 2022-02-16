import request from '@/utils/request'

export function fetchStatusList(query) {
  return request({
    url: '/enums/list',
    method: 'get',
    params: query
  })
}

export function fetchFlowList(query) {
  return request({
    url: '/jobFlow/list',
    method: 'get',
    params: query
  })
}

export async function getFlow(id) {
  return request({
    url: `/jobFlow/get/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export async function updateFlow(data) {
  return request({
    url: '/jobFlow/update',
    method: 'post',
    data
  })
}
