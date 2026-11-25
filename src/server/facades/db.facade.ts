import { container } from '@sidekick-coder/zenith-kit/server'
import DatabaseService from '#server/services/DatabaseService.ts'

const db = container.proxy<DatabaseService>(DatabaseService)

export default db
