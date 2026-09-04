import { PermissionRepository } from '@sidekick-coder/zenith-kit/server'
import db from '#server/facades/db.facade.ts'

const permissionRepository = new PermissionRepository(db as any)

export default permissionRepository
