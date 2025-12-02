import ModelConfig from '#server/mixins/modelConfig.mixin.ts'
import { composeWith } from '#shared/utils/compose.ts'
import Base from '#shared/entities/databaseConnection.entity.ts'

export default class DatabaseConnection extends composeWith(
    Base,
    ModelConfig('database.connections', { readonly: true })
) {}