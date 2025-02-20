import { type Client } from '@monorepo/functions/src/types/reservations'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Mail, Phone } from 'lucide-react'

interface ClientCardProps {
    client: Client
    isEditMode: boolean
    onClientChange: (client: Client) => void
}

export function ClientCard({ client, isEditMode, onClientChange }: ClientCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">Cliente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span>Nombre:</span>
                        <div className="flex items-center gap-2 justify-end">
                            {isEditMode ? (
                                <Input
                                    value={client.name}
                                    onChange={(e) => onClientChange({ ...client, name: e.target.value })}
                                    className="w-48"
                                />
                            ) : (
                                <span>{client.name}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Teléfono:
                        </span>
                        <div className="flex items-center gap-2 justify-end">
                            {isEditMode ? (
                                <Input
                                    value={client.phone}
                                    onChange={(e) => onClientChange({ ...client, phone: e.target.value })}
                                    className="w-48"
                                />
                            ) : (
                                <span>{client.phone}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email:
                        </span>
                        <div className="flex items-center gap-2 justify-end">
                            {isEditMode ? (
                                <Input
                                    value={client.email}
                                    onChange={(e) => onClientChange({ ...client, email: e.target.value })}
                                    className="w-48"
                                />
                            ) : (
                                <span>{client.email}</span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 