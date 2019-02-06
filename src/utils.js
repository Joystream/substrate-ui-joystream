export function strToHex(s) {
    s = unescape(encodeURIComponent(s))
    let h = '0x'
    for (var i = 0; i < s.length; i++) {
        h += s.charCodeAt(i).toString(16)
    }
    return h
}

export function hexToStr(h) {
    let s = ''
    for (let i = 0; i < h.length; i+=2) {
        s += String.fromCharCode(parseInt(h.substr(i, 2), 16))
    }
    return decodeURIComponent(escape(s))
}

/** addr - Account address as a hex string. */
export function shortAddr(addr) {
    return addr.substring(0, 6) + '…' 
        + addr.substring(addr.length - 4)
}

export function vecu8ToStr(vecu8) {
	return hexToStr(bytesToHex(vecu8))
}

export const isDefined = (x) =>
  !notDefined(x)

export const isDef = isDefined

export const notDefined = (x) =>
  x === null || typeof x === 'undefined'

export const notDef = notDefined

export const isObj = (x) =>
  x !== null && typeof x === 'object'

export const isStr = (x) =>
  typeof x === 'string'

export const isNum = (x) =>
  typeof x === 'number'

export const isEmptyStr = (x) =>
  notDefined(x) || isStr(x) && x.trim().length === 0

export const nonEmptyStr = (x) =>
  isStr(x) && x.trim().length > 0

export const parseNumStr = (num) => {
    try { 
        return parseInt(num)
    } catch (err) {
        return undefined
    }
}

export const nonEmptyArr = (x) =>
  Array.isArray(x) && x.length > 0

// For debug only:
window.strToHex = strToHex
window.hexToStr = hexToStr
window.shortAddr = shortAddr