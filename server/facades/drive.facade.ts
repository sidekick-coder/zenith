import DriveService from '#server/services/drive.service.ts'

const drive = new DriveService()

drive.load()

export default drive