export default class MethodMock {
    constructor(name, results, resultFilterMethod) {
        this.name = name
        this.results = results
        this.resultFilterMethod = resultFilterMethod.bind(this)
    }

    prepareResult(result) {
        const preparedResult = {}
        let i = 0

        for (const prop in result) {
            if (Object.prototype.hasOwnProperty.call(result, prop)) {
                preparedResult[i] = result[prop]
                preparedResult[prop] = result[prop]
                i++
            }
        }

        return preparedResult
    }

    contractFunction() {
        this.result = this.prepareResult(this.resultFilterMethod(arguments))

        return {
            call: this.call.bind(this)
        }
    }

    call(options, callback) {
        const error = null

        if (typeof callback === 'function') {
            callback(error, this.result)
        }
    }
}
