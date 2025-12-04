import config from '#server/facades/config.facade.ts'
import router from '#server/facades/router.facade.ts'
import server from '#server/facades/server.facade.ts'
import drive from '#server/facades/drive.facade.ts'
import ExpressService from '#server/services/express.service.ts'

const origins = config.get('cors.origins', '').split(',')
    .map((o: string) => o.trim())
    .filter((o: string) => o.length > 0)

const app = new ExpressService({
    origins,
    router
})

await app.load()

drive.load()

await server.booter.boot()

app.start()