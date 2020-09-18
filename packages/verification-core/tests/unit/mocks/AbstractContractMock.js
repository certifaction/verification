import { numberToHex, padLeft } from 'web3-utils'
import MethodMock from './MethodMock'

const abstractClassError = new Error('Cannot instanciate abstract class')
const abstractMethodError = new Error('Cannot call abstract method')

export default class AbstractContractMock {
    constructor(jsonInterface) {
        if (this.constructor === AbstractContractMock) {
            throw abstractClassError
        }

        const mockResults = this.getMockResults()
        const mockResultFilterMethods = this.getMockResultFilterMethods()
        this.methods = {}

        jsonInterface.forEach(definition => {
            if (
                definition.type === 'function' &&
                mockResults[definition.name] !== undefined &&
                mockResultFilterMethods[definition.name] !== undefined
            ) {
                const method = new MethodMock(definition.name, mockResults[definition.name], mockResultFilterMethods[definition.name])

                this.methods[definition.name] = method.contractFunction.bind(method)
            }
        })
    }

    getPastEvents(event, options, callback) {
        return this.getMockEvents().filter(mockEvent => {
            if (mockEvent.event !== event) {
                return false
            }
            if (typeof options.fromBlock === 'string' || typeof options.toBlock === 'string') {
                throw new Error('String not supported in mock for options "fromBlock" and "toBlock".')
            }
            if (options.topics !== undefined) {
                throw new Error('Option "topics" is not supported in mock.')
            }
            if (options.fromBlock && options.fromBlock > mockEvent.blockNumber) {
                return false
            }
            if (options.toBlock && options.toBlock < mockEvent.blockNumber) {
                return false
            }
            if (options.filter) {
                for (const prop in options.filter) {
                    if (Object.prototype.hasOwnProperty.call(options.filter, prop)) {
                        if (
                            !mockEvent.returnValues[prop] ||
                            (mockEvent.returnValues[prop] && mockEvent.returnValues[prop] !== options.filter[prop])
                        ) {
                            return false
                        }
                    }
                }
            }

            return true
        })
    }

    createHexValue(number, characterAmount) {
        return padLeft(numberToHex(number), characterAmount)
    }

    getMockResults() {
        throw abstractMethodError
    }

    getMockResultFilterMethods() {
        throw abstractMethodError
    }

    getMockEvents() {
        throw abstractMethodError
    }
}
