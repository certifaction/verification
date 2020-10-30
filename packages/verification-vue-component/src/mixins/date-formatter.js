export default {
    methods: {
        dateFormat(timestamp) {
            const date = new Date(timestamp * 1000)
            const options = {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }

            return date.toLocaleString((this.$i18n.locale) ? this.$i18n.locale : 'en', options)
        }
    }
}
