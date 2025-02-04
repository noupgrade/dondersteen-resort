const { Command } = require('commander')
const program = new Command()
const { setConfig } = require('./config')
const designateAsStaff = require('./admins/designateAsStaff')
const listStaffUsers = require('./admins/listStaffUsers')
const runMigration = require('./platform/migrations/runMigration')
const writeVersion = require('./platform/writeVersion')
program.option('--prod', 'Run in production mode', false)

program.addCommand(designateAsStaff)
program.addCommand(listStaffUsers)
program.addCommand(runMigration)
program.addCommand(writeVersion)
program.hook('preAction', command => {
    console.log(`Running in ${command.opts().prod ? 'PROD' : 'LOCAL'} env`)
    setConfig('prod', command.opts().prod)
})

program.parse(process.argv)
