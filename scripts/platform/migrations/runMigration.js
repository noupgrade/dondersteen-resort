const { Command } = require('commander')

const command = new Command('migrate')

const availableMigrations = {
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
