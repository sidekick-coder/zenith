import { UserEntity } from '@sidekick-coder/zenith-kit/shared'
import BelongsTo from './belongsTo.relation.ts'

export default class BelongsToUser extends BelongsTo {
    constructor() {
        super({
            table: 'users',
            tableKey: 'id',
            
            targetTable: 'users',
            targetKey: 'user_id',

            property: 'user',
            serialize: row => UserEntity.from(row)
        })

    }
}
