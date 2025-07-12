import modules from "../services/modules.service.ts"
import router from "../services/router.service.ts"

router.get('/api/modules', () => {
    return modules.list();
})

router.get('/api/modules/:name', ({ request }) => {
    const name = request.params.name;

    return modules.find(name);
});

router.post('/api/modules/:name/toggle', async ({ request }) => {
    const name = request.params.name;
    const query = request.query;

    return modules.toggle(name, query);
});
