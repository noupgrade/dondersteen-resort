import { useTranslation } from 'react-i18next'

import { CheckCircle2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function ImportantNotes() {
    const { t } = useTranslation()

    const notes = [
        t('booking.step2.importantNotes.bowls'),
        t('booking.step2.importantNotes.firstVisit'),
        t('booking.step2.importantNotes.heat'),
        t('booking.step2.importantNotes.vets'),
        t('booking.step2.importantNotes.holidays'),
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('booking.step2.importantNotes.title')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
                {notes.map((note, index) => (
                    <div key={index} className='flex items-start space-x-2'>
                        <CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-500' />
                        <p className='text-sm text-muted-foreground'>{note}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
