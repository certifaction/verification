import sha3 from 'js-sha3'

self.addEventListener('message', function(e) {
    self.postMessage({ status: true, hash: '0x' + sha3.keccak256(e.data) })
}, false)
