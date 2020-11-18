const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
}

export default {
    methods: {
        dateFormat(timestamp, options = defaultOptions) {
            return timestamp.toLocaleString((this.$i18n.locale) ? this.$i18n.locale : 'en', options)
        }
    }
}
