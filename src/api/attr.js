import request from '@/utils/request'

export function getCatalogs() {
  return request({
    url: '/catalog/list',
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getEdgeStates(sourceJobId) {
  return request({
    url: `/attr/edgeStates?jobId=${sourceJobId}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getNodeTypes(type) {
  return request({
    url: `/attr/nodeTypes?type=${type}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getDeployModes(type) {
  return request({
    url: `/attr/deployModes?type=${type}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getStatusList(query) {
  return request({
    url: '/attr/list',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}
