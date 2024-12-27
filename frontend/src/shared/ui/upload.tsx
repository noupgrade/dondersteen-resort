import { ChangeEvent } from 'react'
import { Button } from './button'
import { Upload as UploadIcon } from 'lucide-react'

interface UploadProps {
    onUpload: (file: File) => void
    accept?: string
    children?: React.ReactNode
    className?: string
}

export function Upload({ onUpload, accept = 'image/*', children, className }: UploadProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            onUpload(file)
        }
    }

    return (
        <Button variant="outline" asChild>
            <label className={`cursor-pointer flex items-center ${className || ''}`}>
                <UploadIcon className="mr-2 h-4 w-4" />
                {children}
                <input
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                />
            </label>
        </Button>
    )
} 