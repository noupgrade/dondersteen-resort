export interface SpecialCondition {
    symbol: string
    label: string
    description: string
}

export const SPECIAL_CONDITIONS: SpecialCondition[] = [
    { symbol: 'O', label: 'Medicación', description: 'Medicación' },
    { symbol: '□', label: 'Comida personalizada', description: 'Comida personalizada' },
    { symbol: '△', label: 'Sin cama', description: 'Sin cama' },
    { symbol: 'A', label: 'Alérgico', description: 'Alérgico' },
    { symbol: '⚠', label: 'Warning', description: 'Cuidado' },
    { symbol: 'E', label: 'Escapista', description: 'Escapista' },
    { symbol: '*', label: 'Pienso propio', description: 'Pienso propio' },
    { symbol: '■', label: 'Añadir carne/lata', description: 'Añadir carne/lata al pienso' },
    { symbol: 'L', label: 'Lata propia', description: 'Lata propia' },
    { symbol: '-', label: 'Poco pienso', description: 'Poco pienso' },
    { symbol: '+', label: 'Más pienso', description: 'Más pienso' },
    { symbol: '🧸', label: 'Juguete', description: 'Juguete' },
    { symbol: '🧶', label: 'Manta', description: 'Manta' },
    { symbol: '🛏️', label: 'Cama', description: 'Cama' },
] 