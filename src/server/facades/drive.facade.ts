import di from './di.facade.ts'
import DriveService from '#server/services/drive.service.ts'

const drive = di.proxy<DriveService>(DriveService)

export default drive