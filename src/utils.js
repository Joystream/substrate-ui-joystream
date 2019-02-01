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

// For debug only:
window.strToHex = strToHex
window.hexToStr = hexToStr
window.shortAddr = shortAddr