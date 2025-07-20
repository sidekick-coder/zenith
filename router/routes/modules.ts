import root from '#facades/router.ts'
import authMiddleware from '#router/middlewares/auth.middleware.ts'
import modules from '#services/modules.service.ts'

const router = root.use(authMiddleware)
    .prefix('/api/modules')
    .group()

router.get('/', () => {
    return modules.list()
})

router.get('/:name', ({ params }) => {
    const name = params.name

    return modules.find(name)
})

router.post('/:name/toggle', async ({ params, query }) => {
    console.log('toggle module', params, query)
    const name = params.name

    return modules.toggle(name, query)
})
