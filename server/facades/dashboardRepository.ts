import DashboardRepository from '#server/repositories/DashboardRepository.ts'
import db from '#server/facades/db.facade.ts'

const dashboardRepository = new DashboardRepository(db)

export default dashboardRepository
