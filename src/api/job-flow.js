import request from '@/utils/request'

export function getFlowList(query) {
  return request({
    url: '/jobFlow/list',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
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

export function createFlow(data) {
  return request({
    url: '/jobFlow/create',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export async function updateFlow(data) {
  return request({
    url: '/jobFlow/update',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function deleteFlow(id) {
  return request({
    url: `/jobFlow/delete/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}
