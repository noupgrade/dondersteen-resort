import * as admin from 'firebase-admin'

admin.initializeApp()
export const firestore = admin.firestore()
firestore.settings({ ignoreUndefinedProperties: true })
export const storage = admin.storage()

export const isLocalEnvironment = () => {
    return process.env.FUNCTIONS_EMULATOR === 'true'
}
