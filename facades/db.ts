import di from "./di.ts"
import DatabaseManager from "#database/manager.ts"

const db = di.singleton(DatabaseManager)

export default db