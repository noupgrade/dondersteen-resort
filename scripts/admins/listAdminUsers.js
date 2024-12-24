const { Command } = require('commander')
const {getAuthInstance} = require('../platform/firebase')

const command = new Command('list-admin-users')

command.action(async () => {
    try {
        const listUsersResult = await getAuthInstance().listUsers()
        // print all users
        const adminUsers = listUsersResult.users.filter(user => user.customClaims && user.customClaims.admin === true)

        if (adminUsers.length === 0) {
            console.log('No admin users found.')
        } else {
            console.log('Admin users:')
            adminUsers.forEach(user => {
                console.log(`- ${user.email} (UID: ${user.uid})`)
            })
        }
    } catch (error) {
        console.error('Error listing admin users:', error)
    }
})

module.exports = command
