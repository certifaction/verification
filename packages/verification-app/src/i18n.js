import Vue from 'vue'
import VueI18n from 'vue-i18n'
import merge from 'lodash.merge'

import verificationDateTimeFormats from '@certifaction/verification-vue-component/src/locales/datetime_formats.json'
import verificationDE from '@certifaction/verification-vue-component/src/locales/de.json'
import verificationEN from '@certifaction/verification-vue-component/src/locales/en.json'
import verificationFR from '@certifaction/verification-vue-component/src/locales/fr.json'
import verificationIT from '@certifaction/verification-vue-component/src/locales/it.json'
import pdfViewerDE from '@certifaction/vue-pdf-viewer/src/locales/de.json'
import pdfViewerEN from '@certifaction/vue-pdf-viewer/src/locales/en.json'
import pdfViewerFR from '@certifaction/vue-pdf-viewer/src/locales/fr.json'
import pdfViewerIT from '@certifaction/vue-pdf-viewer/src/locales/it.json'

const dateTimeFormats = {
    de: verificationDateTimeFormats.default,
    en: verificationDateTimeFormats.default,
    fr: verificationDateTimeFormats.default,
    it: verificationDateTimeFormats.default
}

Vue.use(VueI18n)

function loadLocaleMessages() {
    const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
    const messages = {}
    locales.keys().forEach(key => {
        const matched = key.match(/([A-Za-z0-9-_]+)\./i)
        if (matched && matched.length > 1) {
            const locale = matched[1]
            messages[locale] = locales(key)
        }
    })
    return messages
}

let messages = merge({
    de: verificationDE,
    en: verificationEN,
    fr: verificationFR,
    it: verificationIT
}, loadLocaleMessages())
messages = merge({
    de: pdfViewerDE,
    en: pdfViewerEN,
    fr: pdfViewerFR,
    it: pdfViewerIT
}, messages)

export default new VueI18n({
    locale: process.env.VUE_APP_I18N_LOCALE || 'en',
    fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
    dateTimeFormats,
    messages
})
