import { ReactNode, useEffect } from 'react'

import { useAuth } from '@/shared/auth.tsx'

export const WithAnonymousUser = ({ children }: { children: ReactNode }) => {
    const { isLoadingUser, anonymousSignIn, isLoggedIn } = useAuth()

    useEffect(() => {
        const signIn = async () => {
            if (!isLoadingUser && !isLoggedIn) {
                await anonymousSignIn()
            }
        }
        signIn()
    }, [isLoadingUser, anonymousSignIn, isLoggedIn])

    if (isLoggedIn) return <>{children}</>
}
