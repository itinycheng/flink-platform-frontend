import request from '@/utils/request'

export function getCatalog(id) {
  return request({
    url: `/catalog/get/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getCatalogPage(query) {
  return request({
    url: '/catalog/page',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function getCatalogs() {
  return request({
    url: '/catalog/list',
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function createCatalog(data) {
  return request({
    url: '/catalog/create',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function updateCatalog(data) {
  return request({
    url: '/catalog/update',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function deleteCatalog(id) {
  return request({
    url: `/catalog/delete/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}
