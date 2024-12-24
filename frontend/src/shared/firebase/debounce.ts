// eslint-disable-next-line @typescript-eslint/ban-types
export function debounce<T extends Function>(callback: T, wait = 1000) {
    let timeoutId: NodeJS.Timeout
    const callable = (...args: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => callback(...args), wait)
    }
    return callable as unknown as T
}
