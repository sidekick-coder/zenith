import { PermissionAssignmentRepository } from '@sidekick-coder/zenith-kit/server'
import db from '#server/facades/db.facade.ts'

const permissionAssignmentRepository = new PermissionAssignmentRepository(db as any)

export default permissionAssignmentRepository
