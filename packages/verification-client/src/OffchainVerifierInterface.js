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

class Interface {
  constructor (name, methods) {
    if (arguments.length < 2) {
      throw new Error('An Interface expects atleast 2 arguments ' + arguments.length +
        ' arguments passed')
    }
    this.name = name
    this.methods = []

    methods.forEach(method => {
      if (typeof method !== 'string') {
        throw new Error('Interface expects all the method names to be passed as as a string ' +
          method + ' is a ' + typeof method)
      }
      this.methods.push(method)
    }, this)
  }

  static ensureImplements (object) {
    if (arguments.length < 2) {
      throw new Error('Function Interface.ensureImplements called with ' +
        arguments.length + 'arguments, but expected at least 2.')
    }

    for (let i = 1, len = arguments.length; i < len; i++) {
      const interf = arguments[i]
      if (interf.constructor !== Interface) {
        throw new Error('Function expects arguments two or above to be instaces of Interface')
      }

      for (let j = 0, methodsLen = interf.methods.length; j < methodsLen; j++) {
        const method = interf.methods[j]
        if (!object[method] || !typeof object[method] === 'function') {
          throw new Error('Does not implement the method the interface' + interf.name + 'Interface.Method ' +
            method + ' not found')
        }
      }
    }
  }
}

const OffchainVerifierInterface = new Interface('OffchainVerifierInterface', ['verify'])
export {
  Interface,
  OffchainVerifierInterface
}
