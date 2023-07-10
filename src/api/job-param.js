import request from '@/utils/request'

export function getParam(id) {
  return request({
    url: `/jobParam/get/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getParamPage(query) {
  return request({
    url: '/jobParam/page',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function getParamList() {
  return request({
    url: '/jobParam/list',
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function createParam(data) {
  return request({
    url: '/jobParam/create',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function updateParam(data) {
  return request({
    url: '/jobParam/update',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function deleteParam(id) {
  return request({
    url: `/jobParam/delete/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}
