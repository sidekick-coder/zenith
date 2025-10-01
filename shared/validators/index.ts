import * as pagination from './pagination.validator.ts'
import * as permission from './permission.validator.ts'
import * as permissionAssignment from './permissionAssignment.validator.ts'
import * as query from './query.validator.ts'
import * as role from './role.validator.ts'
import * as settingSite from './settingSite.validator.ts'
import * as user from './user.validator.ts'

const schemas = {
    pagination,
    permission,
    permissionAssignment,
    query,
    role,
    settingSite,
    user
}

export default schemas
