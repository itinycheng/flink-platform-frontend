import request from '@/utils/request'

export function getJob(id) {
  return request({
    url: `/jobInfo/get/${id}`,
    method: 'get'
  })
}

export function createJob(data) {
  return request({
    url: '/jobInfo/create',
    method: 'post',
    data
  })
}

export function updateJob(data) {
  return request({
    url: '/jobInfo/update',
    method: 'post',
    data
  })
}

export async function getJobByIds(data) {
  return request({
    url: `/jobInfo/getByIds`,
    method: 'post',
    data
  })
}
