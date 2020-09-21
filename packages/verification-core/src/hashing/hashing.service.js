import HashingWorker from 'web-worker:./hashing.worker'

export default {
    hashFile(file) {
        return new Promise((resolve, reject) => {
            const worker = new HashingWorker()

            worker.addEventListener('message', function(e) {
                worker.terminate()
                if (e.data.status === true) {
                    resolve(e.data.hash)
                } else {
                    reject(e.data.error)
                }
            }, false)

            worker.postMessage(file)
        })
    }
}
