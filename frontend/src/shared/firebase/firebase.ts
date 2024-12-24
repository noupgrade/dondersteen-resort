import { getAnalytics } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import {
    GoogleAuthProvider,
    Unsubscribe,
    connectAuthEmulator,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    getAuth,
    signInWithPopup,
    signOut,
} from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

import { isLocalEnvironment } from '@/shared/lib/environment'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyBkn7zS2oKMNe-Nx09qMyYFfTZcf7nYfxU',
    authDomain: 'dondersteen-resort.firebaseapp.com',
    projectId: 'dondersteen-resort',
    storageBucket: 'dondersteen-resort.appspot.com',
    messagingSenderId: '650334833823',
    appId: '1:650334833823:web:b24764e1ea486e8be266aa',
    measurementId: 'G-B9N8PV2DJ5',
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)
getAnalytics(firebaseApp)
const functions = getFunctions(firebaseApp)
const firestore = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

// // Connect to the emulator if in development
if (isLocalEnvironment) {
    connectAuthEmulator(auth, `http://${window.location.hostname}:5004`)
    connectFunctionsEmulator(functions, window.location.hostname, 5001)
    connectFirestoreEmulator(firestore, window.location.hostname, 5003)
    connectStorageEmulator(storage, window.location.hostname, 5005)
}

type OnAuthStateChangedParams = Parameters<typeof firebaseOnAuthStateChanged>

const onAuthStateChanged = (callback: OnAuthStateChangedParams[1]): Unsubscribe =>
    firebaseOnAuthStateChanged(auth, callback)
export {
    GoogleAuthProvider,
    auth,
    firebaseApp,
    firestore,
    functions,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    storage,
}
