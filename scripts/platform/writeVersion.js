const admin = require('firebase-admin')
const {execSync} = require('child_process')
const {getFirestoreInstance} = require("./firebase");

const isLocal = process.argv.includes('--local')

if (isLocal) {
    firestore.settings({
        host: "localhost:5003",
        ssl: false
    })
}


// Get commit hash from Git
const commitHash = execSync('git rev-parse --short HEAD').toString().trim()

// Check for breaking change flag from environment variable
const isBreaking = process.env.IS_BREAKING_CHANGE === 'true'

// Write the new version to Firestore
const writeNewVersion = async () => {
    try {
        const newVersion = {
            commitHash,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isBreaking,
        }
        await getFirestoreInstance().collection('app_versions').add(newVersion)
        console.log('Version written to Firestore:', {newVersion})
    } catch (error) {
        console.error('Error writing version to Firestore:', error)
        process.exit(1)
    }
}

writeNewVersion()
