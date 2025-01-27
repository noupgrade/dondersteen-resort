export interface Pet {
    id?: string
    name: string
    breed: string
    weight: number
    size: 'pequeño' | 'mediano' | 'grande'
    sex: 'M' | 'F'
    isNeutered?: boolean
} 