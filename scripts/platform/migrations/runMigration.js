const { Command } = require('commander')
const migrateToSubcollections = require('./20241209-migrate-to-subcollections')
const deleteOldData = require('./20241209-delete-old-data')

const command = new Command('migrate')

const availableMigrations = {
  'migrate-to-subcollections': migrateToSubcollections,
  'delete-old-data': deleteOldData
}

command
  .argument('[migrationName]', 'Name of the migration to run')
  .action(async (migrationName) => {
    if (!migrationName) {
      console.log('Available migrations:')
      Object.keys(availableMigrations).forEach(migration => console.log(`- ${migration}`))
      return
    }

    try {
      const migration = availableMigrations[migrationName]
      if (!migration) {
        console.error(`Migration "${migrationName}" not found.`)
        process.exit(1)
      }

      await migration()
      console.log(`Migration "${migrationName}" completed successfully.`)
    } catch (error) {
      console.error(`Error running migration "${migrationName}":`, error)
      process.exit(1)
    }
  })

module.exports = command
