import type Router from './router.service.ts'
import type { HttpContext } from '#server/contracts/router.contract.ts'
import { compose } from '#shared/utils/compose.ts'
import { Hooks } from '#server/mixins/hooks.mixin.ts'

export default class RouterResourceService extends compose(Hooks) {
    public async index(ctx: HttpContext): Promise<any> {
        const error = new Error('Not implemented')

        Object.assign(error, { ctx })

        throw error
    }

    public async show(ctx: HttpContext): Promise<any>  {
        const error = new Error('Not implemented')

        Object.assign(error, { ctx })

        throw error
    }

    public async store(ctx: HttpContext): Promise<any>  {
        const error = new Error('Not implemented')

        Object.assign(error, { ctx })

        throw error
    }

    public async update(ctx: HttpContext): Promise<any>  {
        const error = new Error('Not implemented')

        Object.assign(error, { ctx })

        throw error
    }

    public async destroy(ctx: HttpContext): Promise<any>  {
        const error = new Error('Not implemented')

        Object.assign(error, { ctx })

        throw error
    }

    public register(router: Router) {
        router.get('/', async ctx => {
            
            await this.emit('beforeIndex', ctx)

            const result = await this.index(ctx)

            await this.emit('afterIndex', ctx, result)

            return result
        })

        router.get('/:id', async ctx => {
            await this.emit('beforeShow', ctx)

            const result = await this.show(ctx)

            await this.emit('afterShow', ctx, result)

            return result
        })

        router.post('/', async ctx => {
            await this.emit('beforeStore', ctx)
            await this.emit('beforeSave', ctx)

            const result = await this.store(ctx)

            await this.emit('afterStore', ctx, result)
            await this.emit('afterSave', ctx, result)

            return result
        })

        router.put('/:id', async ctx => {
            await this.emit('beforeUpdate', ctx)
            await this.emit('beforeSave', ctx)

            const result = await this.update(ctx)

            await this.emit('afterUpdate', ctx, result)
            await this.emit('afterSave', ctx, result)

            return result
        })

        router.delete('/:id', async ctx => {
            await this.emit('beforeDestroy', ctx)

            const result = await this.destroy(ctx)

            await this.emit('afterDestroy', ctx, result)

            return result
        })
    }
}