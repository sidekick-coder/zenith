import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/permission.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class Permission extends composeWith(Base, Model('permissions')) {
    
}