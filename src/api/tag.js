import request from '@/utils/request'

export function getTag(id) {
  return request({
    url: `/tag/get/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getTagPage(query) {
  return request({
    url: '/tag/page',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function getTagList(query) {
  return request({
    url: '/tag/list',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function createTag(data) {
  return request({
    url: '/tag/create',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function updateTag(data) {
  return request({
    url: '/tag/update',
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function deleteTag(id) {
  return request({
    url: `/tag/delete/${id}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}
