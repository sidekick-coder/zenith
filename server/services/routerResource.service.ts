import type Router from './router.service.ts'
import type { HttpContext } from '#server/contracts/router.contract.ts'

export default class RouterResourceService {
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
        router.get('/', this.index.bind(this))
        router.get('/:id', this.show.bind(this))
        router.post('/', this.store.bind(this))
        router.put('/:id', this.update.bind(this))
        router.delete('/:id', this.destroy.bind(this))
    }
}