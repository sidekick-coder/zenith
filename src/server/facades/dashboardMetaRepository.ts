import DashboardMetaRepository from '#server/repositories/DashboardMetaRepository.ts'
import db from '#server/facades/db.facade.ts'

const dashboardMetaRepository = new DashboardMetaRepository(db)

export default dashboardMetaRepository
