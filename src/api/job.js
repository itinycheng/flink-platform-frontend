import request from '@/utils/request'

export function getJobList(query) {
  return request({
    url: `/jobInfo/list`,
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function getJobPage(query) {
  return request({
    url: `/jobInfo/page`,
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function getJob(id) {
  return request({
    url: `/jobInfo/get/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function createJob(data) {
  return request({
    url: '/jobInfo/create',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function updateJob(data) {
  return request({
    url: '/jobInfo/update',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export async function deleteJob(id) {
  return request({
    url: `/jobInfo/delete/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export async function getJobByIds(data) {
  return request({
    url: `/jobInfo/getByIds`,
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export async function runOnceJob(id) {
  return request({
    url: `/jobInfo/schedule/runOnce/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

// ----- job run instance -----

export function getJobRun(id) {
  return request({
    url: `/jobRun/get/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getJobRunPage(query) {
  return request({
    url: '/jobRun/page',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export async function getJobRunByJobIds(flowRunId, jobIds) {
  const data = { flowRunId, jobIds }
  return request({
    url: `/jobRun/getJobOrRunByJobIds`,
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export async function getJobOrJobRunList(id, type, ids) {
  return type !== 'instance'
    ? getJobByIds(ids) : getJobRunByJobIds(id, ids)
}

export function getJobOrJobRun(id, type) {
  return type !== 'instance'
    ? getJob(id) : getJobRun(id)
}

export function killJobRun(runId) {
  return request({
    url: `/jobRun/kill/${runId}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}
