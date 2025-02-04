const admin = require('firebase-admin')
const { execSync } = require('child_process')
const { getFirestoreInstance } = require('./firebase')
const { Command } = require('commander')

const command = new Command('write-version')

command
    .option(
        '--is-breaking [value]',
        'Indicates if the new version has a breaking change',
        value => {
            if (typeof value === 'string') {
                return value.toLowerCase() === 'true'
            }
            return value
        },
        false,
    )
    .action(isBreaking => writeNewVersion(isBreaking))

// Get commit hash from Git
const commitHash = execSync('git rev-parse --short HEAD').toString().trim()

const isBreakingEnv = process.env.IS_BREAKING_CHANGE === 'true'

// Write the new version to Firestore
const writeNewVersion = async options => {
    const isBreaking = options.isBreaking || isBreakingEnv

    try {
        const newVersion = {
            commitHash,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isBreaking,
        }
        await getFirestoreInstance().collection('app_versions').add(newVersion)
        console.log('Version written to Firestore:', { newVersion })
    } catch (error) {
        console.error('Error writing version to Firestore:', error)
        process.exit(1)
    }
}

module.exports = command
