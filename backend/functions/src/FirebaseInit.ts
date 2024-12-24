import * as admin from 'firebase-admin'

admin.initializeApp()
export const firestore = admin.firestore()
export const storage = admin.storage()

export const isLocalEnvironment = () => {
    return process.env.FUNCTIONS_EMULATOR === 'true'
}
