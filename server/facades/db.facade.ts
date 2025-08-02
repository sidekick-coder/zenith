import di from './di.facade.ts'
import DatabaseManager from '#server/database/manager.ts'

di.set(DatabaseManager.DI_KEY, new DatabaseManager())

const db = di.proxy<DatabaseManager>(DatabaseManager.DI_KEY)

export default db