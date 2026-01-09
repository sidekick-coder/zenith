import * as pagination from './pagination.validator.ts'
import * as permission from './permission.validator.ts'
import * as permissionAssignment from './permissionAssignment.validator.ts'
import * as url from './url.validator.ts'
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
import * as file from './file.validator.ts'
import * as translator from './translator.validator.ts'
import * as date from './date.validator.ts'
import * as emailTemplate from './emailTemplate.validator.ts'

const schemas = {
    metadata,
    pagination,
    permission,
    permissionAssignment,
    /** @deprecated Use url.validator instead */
    query: url,
    url,
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
    file,
    translator,
    date,
    emailTemplate
}

export default schemas
