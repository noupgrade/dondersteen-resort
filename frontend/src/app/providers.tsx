import { ReactNode } from 'react'

import { AuthProvider } from '@/shared/auth'

export const UnauthenticatedProviders = ({ children }: { children: ReactNode }) => {
    return <AuthProvider>{children}</AuthProvider>
}
