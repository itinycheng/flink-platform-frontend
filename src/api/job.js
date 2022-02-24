import request from '@/utils/request'

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
