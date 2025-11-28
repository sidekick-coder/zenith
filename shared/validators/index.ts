import * as pagination from './pagination.validator.ts'
import * as permission from './permission.validator.ts'
import * as permissionAssignment from './permissionAssignment.validator.ts'
import * as query from './query.validator.ts'
import * as role from './role.validator.ts'
import * as settingSite from './settingSite.validator.ts'
import * as user from './user.validator.ts'
import * as userMeta from './userMeta.validator.ts'
import * as fileMeta from './fileMeta.validator.ts'
import * as connection from './connection.validator.ts'
import * as modules from './modules.validator.ts'
import * as branding from './branding.validator.ts'
import * as pwa from './pwa.validator.ts'
import * as fileUploadSession from './fileUploadSession.validator.ts'
import * as auth from './auth.validator.ts'
import * as metadata from './metadata.validator.ts'

const schemas = {
    metadata,
    pagination,
    permission,
    permissionAssignment,
    query,
    role,
    settingSite,
    user,
    userMeta,
    fileMeta,
    fileUploadSession,
    connection,
    modules,
    branding,
    pwa,
    auth,
}

export default schemas
