import request from '@/utils/request'

export function getWorkspace(id) {
  return request({
    url: `/workspace/get/${id}`,
    method: 'get'
  }).then(res => res.data)
}

export function getWorkspaceList() {
  return request({
    url: '/workspace/list',
    method: 'get'
  }).then(res => res.data)
}

export function getWorkspacePage(query) {
  return request({
    url: '/workspace/page',
    method: 'get',
    params: query
  }).then(res => res.data)
}

export function createWorkspace(data) {
  return request({
    url: '/workspace/create',
    method: 'post',
    data
  }).then(res => res.data)
}

export function updateWorkspace(data) {
  return request({
    url: '/workspace/update',
    method: 'post',
    data
  }).then(res => res.data)
}

export function deleteWorkspace(id) {
  return request({
    url: `/workspace/delete/${id}`,
    method: 'get'
  }).then(res => res.data)
}

export function getWorkspaceWorkers() {
  return request({
    url: '/workspace/workers',
    method: 'get'
  }).then(res => res.data)
}
