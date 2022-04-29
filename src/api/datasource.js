import request from '@/utils/request'

export function getDataSource(id) {
  return request({
    url: `/datasource/get/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getDataSourcePage(query) {
  return request({
    url: '/datasource/page',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function getDataSourceList() {
  return request({
    url: '/datasource/list',
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function createDataSource(data) {
  return request({
    url: '/datasource/create',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function updateDataSource(data) {
  return request({
    url: '/datasource/update',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function deleteDataSource(id) {
  return request({
    url: `/datasource/delete/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}
