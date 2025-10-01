import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/file.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class File extends composeWith(Base, Model('files')) {
    

}