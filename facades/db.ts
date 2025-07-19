import di from './di.ts'
import DatabaseManager from '#database/manager.ts'

di.set(DatabaseManager.DI_KEY, new DatabaseManager())

const db = di.proxy<DatabaseManager>(DatabaseManager.DI_KEY)

export default db