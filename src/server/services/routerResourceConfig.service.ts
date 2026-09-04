import RouterResourceService from './routerResource.service.ts'
import type { RouterResourceOptions } from './routerResource.service.ts'
import type { HttpContext } from '#server/contracts/router.contract.ts'
import type { ConfigModel } from '#server/mixins/modelConfig.mixin.ts'


export default class RouterResourceConfig extends RouterResourceService {
    private model: ConfigModel

    constructor(model: ConfigModel, options: RouterResourceOptions = {}) {
        super(options)

        if (!model.__isConfigModel) {
            throw new Error('RouterResourceConfigService requires a ConfigModel')
        }

        this.model = model
    }

    public async index(_ctx: HttpContext) {
        const items = await this.model.list()

        return {
            items: items
        }
    }

    public async show(ctx: HttpContext) {
        const id = ctx.params.id!

        const item = await this.model.findOrFail(id)

        return item
    }

    public async store(ctx: HttpContext) {
        const data = ctx.request.body as any

        await this.model.create(data)

        return {
            message: 'Resource created successfully'
        }
    }

    public async update(ctx: HttpContext) {
        const id = ctx.params.id!
        const data = ctx.request.body as any

        const updated = await this.model.update(id, data)

        return updated
    }

    public async destroy(ctx: HttpContext) {
        const id = ctx.params.id!

        await this.model.destroy(id)

        return {
            success: true,
        }
    }
}