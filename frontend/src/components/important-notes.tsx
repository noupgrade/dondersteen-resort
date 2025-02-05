import { CheckCircle2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function ImportantNotes() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notas importantes:</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
                {[
                    'No traigas comedero/bebedero, proporcionamos platos de acero inoxidable.',
                    'Para primera visita, sugerimos llegada antes del mediodía. Esto permitirá que tu mascota se acostumbre al nuevo entorno antes de acostarse y nos permitirá observar sus reacciones hacia el entorno.',
                    'No se admiten perras en celo.',
                    'Trabajamos con 2 clínicas veterinarias para emergencias.',
                    'Reserva con anticipación en fechas festivas y vacaciones.',
                ].map((note, index) => (
                    <div key={index} className='flex items-start space-x-2'>
                        <CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-500' />
                        <p className='text-sm text-muted-foreground'>{note}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
