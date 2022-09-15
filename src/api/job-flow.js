import request from '@/utils/request'

export function getFlowPage(query) {
  return request({
    url: '/jobFlow/page',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function getFlowIdNameList(query) {
  return request({
    url: '/jobFlow/idNameMapList',
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

export function purgeFlow(id) {
  return request({
    url: `/jobFlow/purge/${id}`,
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

// ----- flow run instance -----

export function getFlowRunPage(query) {
  return request({
    url: '/jobFlowRun/page',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export async function getFlowRun(id) {
  return request({
    url: `/jobFlowRun/get/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export async function getFlowOrFlowRun(id, type) {
  return type !== 'instance'
    ? getFlow(id) : getFlowRun(id)
}

// ---------- quartz --------
export function parseCronExpr(query) {
  return request({
    url: '/quartz/parseExpr',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}
