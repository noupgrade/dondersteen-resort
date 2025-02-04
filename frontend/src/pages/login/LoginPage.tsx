import { useEffect } from 'react'
import GoogleButton from 'react-google-button'
import { Navigate, useSearchParams } from 'react-router-dom'

import { motion } from 'framer-motion'

import { useAuth } from '@/shared/auth.tsx'
import { GoogleAuthProvider, auth, signInWithPopup } from '@/shared/firebase/firebase.ts'
import { TrackingService } from '@/shared/lib/tracking'
import { Card, CardContent } from '@/shared/ui/card'

function LoginButton(props: { onClick: () => Promise<void> }) {
    return (
        <div className='relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50'>
            {/* Decorative elements */}
            <div className='absolute inset-0 overflow-hidden'>
                <div className='absolute -left-4 top-0 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl' />
                <div className='absolute -right-4 bottom-0 h-72 w-72 rounded-full bg-pink-100/50 blur-3xl' />
            </div>

            {/* Content */}
            <div className='relative flex min-h-screen flex-col items-center justify-center p-4'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className='w-full max-w-md bg-white/80 backdrop-blur-sm'>
                        <CardContent className='flex flex-col items-center space-y-6 p-8'>
                            {/* Logo */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                                className='w-full max-w-[300px]'
                            >
                                <img src='/dondersteen-logo.png' alt='Dondersteen Resort' className='w-full' />
                            </motion.div>

                            {/* Animation */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
                                className='w-full'
                            >
                                <iframe
                                    id='lottie-iframe'
                                    className='mb-6 hidden h-[15rem] w-full'
                                    src='https://lottie.host/embed/92f7c9fe-86ba-4fd9-aa13-55dee1fa78e8/KIH4iMVvmn.json'
                                    onLoad={() => document.getElementById('lottie-iframe')!.classList.remove('hidden')}
                                />
                            </motion.div>

                            {/* Login Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <GoogleButton
                                    onClick={props.onClick}
                                    label='Inicia sesión con Google'
                                    className='!w-full !rounded-lg !bg-blue-600 !text-sm !font-medium !transition-colors hover:!bg-blue-700'
                                />
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}

export const LoginPage = () => {
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const redirect = searchParams.get('redirect')

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, new GoogleAuthProvider())
        } catch (error) {
            console.error('Error logging in:', error)
        }
    }

    if (user && !user.isAnonymous) return <Navigate to={redirect ?? '/'} />

    return <LoginButton onClick={handleLogin} />
}
