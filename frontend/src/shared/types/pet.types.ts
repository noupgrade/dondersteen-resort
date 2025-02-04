const SIZES = ['pequeño', 'mediano', 'grande'] as const
export type PetSize = typeof SIZES[number]