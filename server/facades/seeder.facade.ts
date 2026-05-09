import { container, SeederService } from '@sidekick-coder/zenith-kit/server'

const seeder = container.proxy<SeederService>(SeederService)

export default seeder
