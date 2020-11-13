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
            const date = new Date(timestamp * 1000)

            return date.toLocaleString((this.$i18n.locale) ? this.$i18n.locale : 'en', options)
        },
        isoStringToTimestamp(s) {
            const b = s.split(/\D+/)
            return (new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]) - 3600000)).getTime() / 1000
        }
    }
}
