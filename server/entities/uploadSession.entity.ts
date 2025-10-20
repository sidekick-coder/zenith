import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/uploadSession.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import { Hooks } from '#server/mixins/hooks.mixin.ts'

export default class UploadSession extends composeWith(
    Base,
    Hooks,
    Model('upload_sessions')
) {    
}