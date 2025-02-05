import { useTranslation } from 'react-i18next'

import { Button } from './button'
import { SpainFlag, UKFlag } from './flags'

export function LanguageSwitchButton() {
    const { i18n } = useTranslation()

    const toggleLanguage = () => {
        const newLanguage = i18n.language === 'es' ? 'en' : 'es'
        i18n.changeLanguage(newLanguage)
    }

    return (
        <Button
            variant='outline'
            size='sm'
            className='flex h-[34px] min-w-[52px] items-center justify-center bg-accent p-1 font-semibold hover:bg-accent/80'
            onClick={toggleLanguage}
        >
            {i18n.language === 'es' ? <UKFlag /> : <SpainFlag />}
        </Button>
    )
}
