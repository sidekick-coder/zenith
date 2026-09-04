import di from './di.facade.ts'
import DatabaseService from '#server/services/database.service.ts'

const db = di.proxy<DatabaseService>(DatabaseService)

export default db