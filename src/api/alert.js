import request from '@/utils/request'

export function getAlert(id) {
  return request({
    url: `/alert/get/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getAlertPage(query) {
  return request({
    url: '/alert/page',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function getAlertList() {
  return request({
    url: '/alert/list',
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function createAlert(data) {
  return request({
    url: '/alert/create',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function updateAlert(data) {
  return request({
    url: '/alert/update',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function deleteAlert(id) {
  return request({
    url: `/alert/delete/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}
