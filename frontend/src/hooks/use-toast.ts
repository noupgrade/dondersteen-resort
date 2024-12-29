import { useCallback, useState } from 'react'

export type Toast = {
    id: string
    title?: string
    description?: string
    duration?: number
    variant?: 'default' | 'success' | 'error' | 'warning' | 'destructive'
}

type ToastOptions = Omit<Toast, 'id'>

const DEFAULT_TOAST_DURATION = 3000

let toastCount = 0

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const toast = useCallback((options: ToastOptions) => {
        const id = String(++toastCount)
        const newToast: Toast = {
            id,
            duration: DEFAULT_TOAST_DURATION,
            variant: 'default',
            ...options
        }

        setToasts(currentToasts => [...currentToasts, newToast])

        if (newToast.duration !== Infinity) {
            setTimeout(() => {
                setToasts(currentToasts =>
                    currentToasts.filter(toast => toast.id !== id)
                )
            }, newToast.duration)
        }

        return {
            id,
            dismiss: () => setToasts(currentToasts =>
                currentToasts.filter(toast => toast.id !== id)
            )
        }
    }, [])

    const dismiss = useCallback((toastId: string) => {
        setToasts(currentToasts =>
            currentToasts.filter(toast => toast.id !== toastId)
        )
    }, [])

    const dismissAll = useCallback(() => {
        setToasts([])
    }, [])

    return {
        toast,
        dismiss,
        dismissAll,
        toasts
    }
}

export { type ToastOptions }
