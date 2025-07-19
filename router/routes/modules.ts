import router from "#facades/router.ts"
import modules from "#services/modules.service.ts"

router.get('/api/modules', () => {
    return modules.list()
})

router.get('/api/modules/:name', ({ params }) => {
    const name = params.name

    return modules.find(name)
})

router.post('/api/modules/:name/toggle', async ({ params, query }) => {
    const name = params.name

    return modules.toggle(name, query)
})
