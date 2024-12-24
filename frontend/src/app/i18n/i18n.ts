import { initReactI18next } from 'react-i18next'

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

import { isTestEnvironment } from '../../shared/lib/environment.ts'

i18n.use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: ['en', 'es'],
        debug: true,
        saveMissing: isTestEnvironment,
        saveMissingTo: 'all',
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
            addPath: '/locales/{{lng}}/{{ns}}.json', // Path to save missing keys
        },
    })

export default i18n
