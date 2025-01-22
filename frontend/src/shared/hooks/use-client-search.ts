import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface UseClientSearchProps {
    onClientSelect: (clientId: string, petId?: string) => void
    redirectPath: string
    requirePetSelection?: boolean
}

export function useClientSearch({ onClientSelect, redirectPath, requirePetSelection = false }: UseClientSearchProps) {
    const [isOpen, setIsOpen] = useState(false)

    const handleOpen = () => setIsOpen(true)
    const handleClose = () => setIsOpen(false)

    const handleClientSelect = (clientId: string, petId?: string) => {
        onClientSelect(clientId, petId)
        handleClose()
    }

    return {
        isOpen,
        handleOpen,
        handleClose,
        handleClientSelect,
        redirectPath,
        requirePetSelection
    }
} 