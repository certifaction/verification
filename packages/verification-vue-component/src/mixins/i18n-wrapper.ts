export default {
    methods: {
        _$t(key, ...values) {
            if (typeof this.$t === 'function') {
                return this.$t(key, ...values)
            }
            return key
        },
        _$tm(key) {
            if (typeof this.$tm === 'function') {
                return this.$tm(key)
            }
            return []
        },
        _$rt(key) {
            if (typeof this.$rt === 'function') {
                return this.$rt(key)
            }
            return key
        },
        _$d(value, ...args) {
            if (typeof this.$d === 'function') {
                return this.$d(value, ...args)
            }
            return false
        },
        _$n(value, ...args) {
            if (typeof this.$n === 'function') {
                return this.$n(value, ...args)
            }
            return false
        },
    },
}
