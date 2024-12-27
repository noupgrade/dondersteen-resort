interface ToastProps {
    title: string
    description: string
    variant?: 'default' | 'destructive'
}

export function useToast() {
    const toast = (props: ToastProps) => {
        // Aquí iría la implementación real del toast usando una librería como react-hot-toast o similar
        console.log('Toast:', props)
    }

    return { toast }
} 