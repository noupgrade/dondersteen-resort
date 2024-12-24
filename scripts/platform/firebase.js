const admin = require('firebase-admin')
const {GoogleAuth} = require('google-auth-library')
const {getConfig} = require('../config')
const {FieldValue} = require('firebase-admin/firestore')

let isAppInitialized = false
let firestore = undefined
let auth = undefined

const initializeApp = () => {
    if (!isAppInitialized) {
        console.log('Initializing Firebase app...')
        if ( !getConfig().prod ) {
            process.env.FIRESTORE_EMULATOR_HOST = 'localhost:5003'
            process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:5004'
        }
        admin.initializeApp({
            projectId: 'dondersteen-resort',
            credential: admin.credential.applicationDefault(), // To make it work: gcloud auth application-default login
        })

        isAppInitialized = true
    }
}

const getFirestoreInstance = () => {
    if (!firestore) {
        console.log('Initializing Firestore instance...')
        initializeApp()
        firestore = admin.firestore()
    }

    return firestore
}

const getAuthInstance = () => {
    if (!auth) {
        console.log('Initializing Auth instance...')
        initializeApp()
        auth = admin.auth()
    }
    return auth
}


const getAccessToken = async () => {
    const googleAuth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'], // Adjust the scope as needed
    })

    const client = await googleAuth.getClient()

    return client.getAccessToken()
}

module.exports = {
    getFirestoreInstance,
    getAccessToken,
    getAuthInstance,
    FieldValue,
}
