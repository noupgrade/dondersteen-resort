import 'react-i18next'

import { resources } from './locales/en/translation'

declare module 'react-i18next' {
    interface Resources {
        translation: (typeof resources)['en']['translation']
    }
}
