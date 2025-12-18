import BelongsTo from './belongsTo.relation.ts'
import User from '#server/entities/user.entity.ts'

export default class BelongsToUser extends BelongsTo {
    constructor() {
        super({
            table: 'users',
            tableKey: 'id',
            
            targetTable: 'users',
            targetKey: 'user_id',

            property: 'user',
            serialize: row => User.from(row)
        })

    }
}