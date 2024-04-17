import Cookies from 'js-cookie'

const TokenKey = 'platform_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

import axios from 'axios'
const x2js = require('x2js')
const x2jsone = new x2js() // 实例

export async function validTicket(href) {
  if (getToken()) {
    return true
  }

  // 验证是否登陆
  var result = false
  if (href.indexOf('ticket') !== -1) {
    const ticket = href.split('ticket=')[1].split('#')[0]
    await getUsername(ticket).then(res => {
      result = res
    })
  } else {
    window.location.href = process.env.VUE_APP_SSO_URL + '/login?service=' + process.env.VUE_APP_SERVER_URL
  }
  return result
}

async function getUsername(ticket) {
  var result = false
  var url = process.env.VUE_APP_SSO_URL + '/serviceValidate?service=' + process.env.VUE_APP_SERVER_URL + '&ticket=' + ticket
  await axios.get(url).then(res => {
    var xml = x2jsone.xml2js(res.data)
    if (xml.serviceResponse.authenticationFailure) {
      window.location.href = process.env.VUE_APP_SSO_URL + '/login?service=' + process.env.VUE_APP_SERVER_URL
    }
    if (xml.serviceResponse.authenticationSuccess) {
      var username = xml.serviceResponse.authenticationSuccess.user.__text
      setToken(username)
      result = true
    }
  })
  return result
}
