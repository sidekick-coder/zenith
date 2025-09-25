import * as permission from './permission.validator.ts'
import * as permissionAssignment from './permissionAssignment.validator.ts'
import * as pagination from './pagination.ts'

const schemas = {
    pagination: pagination.schema,
    permission: permission,
    permissionAssignment: permissionAssignment
}

export default schemas