import path from 'path'
import { defineServerSetup } from '#server/utils/defineServerSetup.ts'

export default defineServerSetup(async ({ router }) => {
    await router.loadDirectory(path.resolve(import.meta.dirname, 'routes'))
})