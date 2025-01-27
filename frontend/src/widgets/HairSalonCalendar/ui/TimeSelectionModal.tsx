import { Button } from '@/shared/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog'

interface TimeSelectionModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectTime: (minutes: number) => void
    hour: string
}

export function TimeSelectionModal({
    isOpen,
    onClose,
    onSelectTime,
    hour,
}: TimeSelectionModalProps) {
    const minutes = [0, 15, 30, 45]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Seleccionar minuto</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    {minutes.map((minute) => (
                        <Button
                            key={minute}
                            onClick={() => onSelectTime(minute)}
                            variant="outline"
                            className="text-lg"
                        >
                            {hour}:{minute.toString().padStart(2, '0')}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
} 