/**
 * Formats a number as a currency string in EUR (€)
 * @param amount - The amount to format
 * @returns A formatted string with the amount in EUR
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount)
} 