import type {
    Request, 
    Response,
} from 'express'
import multer from 'multer'
import { tmpPath } from '../utils/index.ts'
import { cuid } from '#server/utils/cuid.util.ts'

export default class UploadService {
    private request: Request
    private response: Response
    private upload: multer.Multer

    constructor(request: Request, response: Response) {
        this.request = request
        this.response = response
        this.upload = multer({
            storage: multer.diskStorage({
                destination: tmpPath('uploads'),
                filename: (_req, file, cb) => cb(null, cuid() + '-' + file.originalname)
            })
        })
    }

    public single(name: string){
        return new Promise<Express.Multer.File | undefined>((resolve, reject) => {
            const single = this.upload.single(name)

            single(this.request, this.response, (err) => {
                if (err) {
                    return reject(err)
                }

                const file = (this.request as any)[name] as Express.Multer.File | undefined

                if (!file) {
                    return resolve(undefined)
                }

                resolve(file)
            })

        })
    }

    public multiple(name: string) {
        return new Promise<Express.Multer.File[] | undefined>((resolve, reject) => {
            const multiple = this.upload.array(name)

            multiple(this.request, this.response, (err) => {
                if (err) {
                    return reject(err)
                }

                const files = (this.request as any)[name] as Express.Multer.File[] | undefined

                if (!files || files.length === 0) {
                    return resolve(undefined)
                }

                resolve(files)
            })
        })
    }
}