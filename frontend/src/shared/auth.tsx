import React, { createContext, useContext, useEffect, useState } from 'react'

import { User as FUser, signInAnonymously } from 'firebase/auth'

import { auth, onAuthStateChanged } from '@/shared/firebase/firebase.ts'

import { TrackingService } from './lib/tracking'

type User = FUser & { isStaff: boolean }

interface AuthContextType {
    user?: User
    isLoggedIn: boolean
    isLoadingUser: boolean
    anonymousSignIn: () => Promise<User>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within a UserProvider')
    }
    return context
}

export const useUser = () => {
    const context = useAuth()
    if (context.user === undefined) {
        throw new Error('useUser must be used within an authenticated UserProvider')
    }
    return context.user
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const isLoggedIn = user !== undefined

    useEffect(
        () =>
            onAuthStateChanged(async newUser => {
                if (newUser) {
                    const token = await newUser.getIdTokenResult()
                    // @ts-expect-error adding custom property to user.
                    //  Using it this way to avoid losing the methods of the user object
                    newUser.isStaff = !!token.claims.isStaff
                    setUser(newUser as User)
                    TrackingService.identify(newUser.uid)
                    TrackingService.setUser({
                        id: newUser.uid,
                        avatar: newUser.photoURL,
                        email: newUser.email,
                        name: newUser.displayName,
                        phone: newUser.phoneNumber,
                        // @ts-expect-error custom property of user.
                        type: newUser.isStaff ? 'staff' : 'end-customer',
                    })
                } else setUser(undefined)
                if (isLoading) setIsLoading(false)
            }),
        [],
    )

    const anonymousSignIn = async () => {
        setIsLoading(true)
        return await signInAnonymously(auth)
            .then(
                (credentials): User => ({
                    ...credentials.user,
                    isStaff: false,
                }),
            )
            .finally(() => setIsLoading(false))
    }

    const value: AuthContextType = {
        anonymousSignIn,
        user,
        isLoggedIn,
        isLoadingUser: isLoading,
    }

    return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>
}
