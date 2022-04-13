import request from '@/utils/request'

export function createWorker(data) {
  return request({
    url: '/worker/create',
    method: 'post',
    data
  })
}

export function updateWorker(data) {
  return request({
    url: '/worker/update',
    method: 'post',
    data
  })
}

export function getWorkerPage(query) {
  return request({
    url: '/worker/page',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function getWorker(id) {
  return request({
    url: `/worker/get/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}
