import sha3 from 'js-sha3'

self.addEventListener('message', function(e) {
    const reader = new FileReader()

    reader.onload = () => {
        self.postMessage({ status: true, hash: '0x' + sha3.keccak256(reader.result) })
    }

    reader.onerror = (error) => {
        self.postMessage({ status: false, error })
    }

    reader.readAsArrayBuffer(e.data)
}, false)
