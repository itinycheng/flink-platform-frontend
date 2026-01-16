import request from '@/utils/request'

export function getEdgeStatusList() {
  return request({
    url: `/attr/edgeStates`,
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

export async function getNodeClassification(name) {
  return await request({
    url: `/attr/nodeClassification?jobType=${name}`,
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
    url: '/attr/enums',
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

export function getVersions(type) {
  return request({
    url: `/attr/versions?type=${type}`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getPreconditions() {
  return request({
    url: `/attr/preconditions`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}

export function getDependentRelations() {
  return request({
    url: `/attr/dependentRelations`,
    method: 'get'
  }).then(res => {
    return res.data
  })
}
