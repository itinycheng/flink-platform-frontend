import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout(token) {
  return request({
    url: '/logout',
    method: 'post',
    data: { 'token': token }
  })
}

export function createUser(data) {
  return request({
    url: '/user/create',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}

export function getUserPage(query) {
  return request({
    url: '/user/page',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function getUser(id) {
  return request({
    url: `/user/get/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getUserWorkers() {
  return request({
    url: '/user/workers',
    method: 'get'
  }).then(res => {
    return res.data
  })
}
