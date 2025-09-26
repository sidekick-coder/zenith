import * as pagination from './pagination.validator.ts'
import * as permission from './permission.validator.ts'
import * as permissionAssignment from './permissionAssignment.validator.ts'
import * as role from './role.validator.ts'
import * as settingSite from './settingSite.validator.ts'

const schemas = {
    pagination,
    permission,
    permissionAssignment,
    role,
    settingSite,
}

export default schemas
