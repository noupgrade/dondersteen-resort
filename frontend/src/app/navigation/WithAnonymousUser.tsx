import { ReactNode, useEffect } from 'react'

import { useAuth } from '@/shared/auth.tsx'
import { TrackingService } from '@/shared/lib/tracking'

export const WithAnonymousUser = ({ children, userType }: { children: ReactNode; userType: string }) => {
    console.log('WithAnonymousUser', { children, userType })
    const { isLoadingUser, anonymousSignIn, isLoggedIn } = useAuth()

    useEffect(() => {
        const signIn = async () => {
            if (!isLoadingUser && !isLoggedIn) {
                const user = await anonymousSignIn()
                TrackingService.identify(user.uid)
                TrackingService.setUser({
                    id: user.uid,
                    type: userType,
                })
            }
        }
        signIn()
    }, [isLoadingUser, anonymousSignIn, isLoggedIn])

    if (isLoggedIn) return <>{children}</>
}
