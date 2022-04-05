import request from '@/utils/request'

export function getResource(id) {
  return request({
    url: `/resource/get/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getResourcePage(query) {
  return request({
    url: '/resource/page',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function getResourceList(query) {
  return request({
    url: '/resource/list',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function createResource(data) {
  return request({
    url: '/resource/create',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function updateResource(data) {
  return request({
    url: '/resource/update',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function deleteResource(id) {
  return request({
    url: `/resource/delete/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function deleteFile(data) {
  return request({
    url: `/resource/deleteFile`,
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}
