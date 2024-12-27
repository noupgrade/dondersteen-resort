interface ToastProps {
    title: string
    description?: string
    variant?: 'default' | 'destructive'
}

export function useToast() {
    const toast = (props: ToastProps) => {
        // Por ahora, solo mostraremos los mensajes en la consola
        console.log(`Toast: ${props.title}${props.description ? ` - ${props.description}` : ''}`)
    }

    return { toast }
} 