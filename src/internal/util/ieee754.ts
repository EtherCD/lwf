const POW2 = new Float64Array(2048)
for (let i = -1024; i < 1024; i++) {
    POW2[i + 1024] = Math.pow(2, i)
}
function pow2_cached(exp) {
    return POW2[exp + 1024] || Math.pow(2, exp)
}

export function read(buffer, offset, isLE, mLen, nBytes) {
    var e, m
    var eLen = nBytes * 8 - mLen - 1
    var eMax = (1 << eLen) - 1
    var eBias = eMax >> 1
    var nBits = -7
    var i = isLE ? nBytes - 1 : 0
    var d = isLE ? -1 : 1
    var s = buffer[offset + i]

    i += d

    e = s & ((1 << -nBits) - 1)

    s >>= -nBits

    nBits += eLen

    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    m = e & ((1 << -nBits) - 1)

    e >>= -nBits

    nBits += mLen

    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    if (e === 0) {
        e = 1 - eBias
    } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity
    } else {
        m = m + pow2_cached(mLen)

        e = e - eBias
    }

    return (s ? -1 : 1) * m * pow2_cached(e - mLen)
}

export function write(buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c

    var eLen = nBytes * 8 - mLen - 1

    var eMax = (1 << eLen) - 1

    var eBias = eMax >> 1

    var rt = mLen === 23 ? pow2_cached(-24) - pow2_cached(-77) : 0

    var i = isLE ? 0 : nBytes - 1

    var d = isLE ? 1 : -1

    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

    value = Math.abs(value)

    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0

        e = eMax
    } else {
        e = Math.floor(Math.log2(value))

        if (value * (c = pow2_cached(-e)) < 1) {
            e--

            c *= 2
        }

        if (e + eBias >= 1) {
            value += rt / c
        } else {
            value += rt * pow2_cached(1 - eBias)
        }

        if (value * c >= 2) {
            e++

            c /= 2
        }

        if (e + eBias >= eMax) {
            m = 0

            e = eMax
        } else if (e + eBias >= 1) {
            m = (value * c - 1) * pow2_cached(mLen)

            e = e + eBias
        } else {
            m = value * pow2_cached(eBias - 1) * pow2_cached(mLen)

            e = 0
        }
    }

    for (
        ;
        mLen >= 8;
        buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8
    ) {}

    e = (e << mLen) | m

    eLen += mLen

    for (
        ;
        eLen > 0;
        buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8
    ) {}

    buffer[offset + i - d] |= s * 128
}
