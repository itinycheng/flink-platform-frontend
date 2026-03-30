import request from '@/utils/request'

export function getConfig(id) {
  return request({
    url: `/config/get/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getConfigPage(query) {
  return request({
    url: '/config/page',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function getConfigList() {
  return request({
    url: '/config/list',
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function createConfig(data) {
  return request({
    url: '/config/create',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function updateConfig(data) {
  return request({
    url: '/config/update',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function deleteConfig(id) {
  return request({
    url: `/config/delete/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function purgeConfig(id) {
  return request({
    url: `/config/purge/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}
