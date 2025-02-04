import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@/shared/auth.tsx'

interface Props extends PropsWithChildren {
    redirect?: string
}

export const ProtectedStaffPage = ({ children, redirect }: Props) => {
    const { user, isLoadingUser } = useAuth()

    if (isLoadingUser) return null

    if (!user || !user.isStaff)
        return <Navigate to={`/login?redirect=${encodeURIComponent(redirect ?? location.pathname)}`} />

    return children
}
