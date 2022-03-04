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

export async function updateGraph(data) {
  return request({
    url: '/jobFlow/updateFlow',
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

export function runOnceFlow(id) {
  return request({
    url: `/jobFlow/schedule/runOnce/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function stopSchedFlow(id) {
  return request({
    url: `/jobFlow/schedule/stop/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function startSchedFlow(id) {
  return request({
    url: `/jobFlow/schedule/start/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}
