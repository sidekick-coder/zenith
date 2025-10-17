import fs from 'fs'
import _ from 'lodash'

export class TemplateService {
    public render(contents: string, data: Record<string, any>){
        const compiled = _.template(contents)

        return compiled(data)
    }

    public async fromFile(source: string, data: Record<string, any> = {}) {
        if (!fs.existsSync(source)) {
            throw new Error(`Template file ${source} does not exist.`)
        }

        const contents = fs.readFileSync(source, 'utf-8')

        return this.render(contents, data)
    }
}

const template = new TemplateService()

export default template
