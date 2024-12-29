import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Toast } from '@/hooks/use-toast'
import { X } from 'lucide-react'

type ToastProps = {
    toast: Toast
    onDismiss: (id: string) => void
}

function ToastComponent({ toast, onDismiss }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100)
        return () => clearTimeout(timer)
    }, [])

    const baseClasses = `
        fixed right-4 p-4 rounded-lg shadow-lg 
        transition-all duration-300 transform
        flex flex-col gap-1 max-w-sm bg-white
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
    `

    const variantClasses = {
        default: 'border-l-4 border-blue-500',
        success: 'border-l-4 border-green-500',
        error: 'border-l-4 border-red-500',
        warning: 'border-l-4 border-yellow-500'
    }

    return (
        <div className={`${baseClasses} ${variantClasses[toast.variant || 'default']}`}>
            <div className="flex justify-between items-start">
                {toast.title && (
                    <h4 className="font-semibold text-gray-900">{toast.title}</h4>
                )}
                <button
                    onClick={() => onDismiss(toast.id)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X size={16} />
                </button>
            </div>
            {toast.description && (
                <p className="text-sm text-gray-600">{toast.description}</p>
            )}
        </div>
    )
}

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[], onDismiss: (id: string) => void }) {
    return createPortal(
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast, index) => (
                <ToastComponent
                    key={toast.id}
                    toast={toast}
                    onDismiss={onDismiss}
                />
            ))}
        </div>,
        document.body
    )
} 