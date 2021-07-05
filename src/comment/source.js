export default function buildMakeSource ({ isValidIp }) {
  return function makeSource ({ ip, browser, referrer } = {}) {
    if (!ip) {
      throw new Error('El origen del comentario debe contener una IP.')
    }
    if (!isValidIp(ip)) {
      throw new RangeError('El origen del comentario debe contener una IP valida.')
    }
    return Object.freeze({
      getIp: () => ip,
      getBrowser: () => browser,
      getReferrer: () => referrer
    })
  }
}
