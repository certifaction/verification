/*
 * Copyright (c) 2020 Certifaction AG
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import Client from '../src/Client'

const client = new Client(
  'wss://ropsten.infura.io/ws/v3/4876e0df8d31475799c8239ba2538c4c',
    '0xec70947cbb9bbf8b94acaeca861ddbc933b3c789',
    '0x4bb056574fc19d089e98814d2c8447b2a203b639',
    '0xd88319a418cf65544f470cacd728b2420e100d20',)

describe('Client', function () {
  it('should verify a registered hash', async function (done) {
    const res = await client.verifyFile(
      '0x0054f251825dcda879ab6f3dd1e3dd134db01c1a9d1b733775c956b7f179bd0b')
    expect(res).toHaveProperty('issuer')
    expect(res.issuer).not.toBe(null)
    done()
  })

  it('should return nullified object for an unregistered hash', async function (done) {
    const res = await client.verifyFile(
      '0xde9b4cf10e72330f5926b26398ba5ffb63b8640407ba30370f21740e16a4484d')
    expect(res.issuer).toBe(null)
    done()
  })

  it('should verify a registered hash based on claims only', async function (done) {
    const res = await client.verifyFile(
        '0x0be52e65121a2761a837ba5b6702a0961b71b57e4f523739bdca8bdfb026fce5')
    expect(res).toHaveProperty('issuer')
    expect(res.issuer).not.toBe(null)
    done()
  })

  afterAll(() => {
    client.close()
  })
})
