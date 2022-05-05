import request from '@/utils/request'

export function getJobToDbTypeMap() {
  return request({
    url: `/reactive/jobToDbTypes`,
    method: 'get',
  }).then(res => {
    return res.data
  })
}

export function execJob(data) {
  return request({
    url: `/reactive/execJob`,
    method: 'post',
    data
  }).then(res => {
    return res.data
  })
}

export function getExecLog(execId, query) {
  return request({
    url: `/reactive/execLog/${execId}`,
    method: 'get',
    params: query
  }).then(res => {
    return res.data
  })
}

