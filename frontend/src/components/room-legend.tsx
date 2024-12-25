'use client'

export function RoomLegend() {
    const legendItems = [
        { symbol: '*', description: 'Pienso propio' },
        { symbol: '■', description: 'Añadir carne/lata al pienso' },
        { symbol: '□', description: 'Carne fresca (nevera/congelador)' },
        { symbol: 'O', description: 'Medicación (ver panel)' },
        { symbol: '△', description: 'Sin cama' },
        { symbol: 'A', description: 'Alérgico' },
        { symbol: 'L', description: 'Lata propia' },
        { symbol: '†', description: 'Ciudad muerde' },
        { symbol: '-', description: 'Poco pienso' },
        { symbol: 'E', description: 'Escapista' },
    ]

    return (
        <div className='rounded-lg border bg-white p-4'>
            <h3 className='mb-3 font-semibold'>Leyenda</h3>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-5'>
                {legendItems.map(item => (
                    <div key={item.symbol} className='flex items-center gap-2'>
                        <span className='font-mono text-lg'>{item.symbol}</span>
                        <span className='text-sm text-gray-600'>{item.description}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
