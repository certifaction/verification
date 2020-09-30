module.exports = {
    // Use node environment because jsdom@26 (default) has a problem with Buffer.from()
    // is not instanceof Uint8Array (https://github.com/facebook/jest/issues/7780#issuecomment-669828353)
    testEnvironment: 'node'
}
