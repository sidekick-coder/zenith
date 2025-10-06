import di from './di.facade.ts'
import DatabaseService from '#server/services/database.service.ts'

di.set(DatabaseService.KEY, new DatabaseService())

const db = di.proxy<DatabaseService>(DatabaseService.KEY)

export default db