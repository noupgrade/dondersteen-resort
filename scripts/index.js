const { Command } = require('commander')
const program = new Command()
const { setConfig } = require('./config')
const designateAsAdmin = require('./admins/designateAsAdmin')
const listAdminUsers = require('./admins/listAdminUsers')
const runMigration = require('./platform/migrations/runMigration')

program.option('--prod', 'Run in production mode', false)

program.addCommand(designateAsAdmin)
program.addCommand(listAdminUsers)
program.addCommand(runMigration)

program.hook('preAction', command => {
    console.log(`Running in ${command.opts().prod ? 'PROD' : 'LOCAL'} env`)
    setConfig('prod', command.opts().prod)
})

program.parse(process.argv)
