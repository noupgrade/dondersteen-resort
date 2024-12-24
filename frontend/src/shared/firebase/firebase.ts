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
    apiKey: "AIzaSyA2Ttfl8dPWRmInMCqL9oAJewl3ymHq_58",
    authDomain: "dondersteen-resort.firebaseapp.com",
    projectId: "dondersteen-resort",
    storageBucket: "dondersteen-resort.firebasestorage.app",
    messagingSenderId: "969555424520",
    appId: "1:969555424520:web:1f3230920e0432b4c9a8bd",
    measurementId: "G-4GE41TFN8J"
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
