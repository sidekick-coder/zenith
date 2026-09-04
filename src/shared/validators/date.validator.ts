import { format as formatDate } from 'date-fns'
import validator from '#shared/services/validator.service.ts'

export const date = () => validator.create(v => v.pipe(
    v.union([v.date(), v.string()]),
    v.transform((value) => {
        if (typeof value === 'string') {
            const timestamp = Date.parse(value)
            
            if (isNaN(timestamp)) {
                throw new Error('Invalid date string')
            }

            return new Date(timestamp)
        }

        return value
    })
))

export const format = (formatString: string) => validator.create(v => v.pipe(
    date(), 
    v.transform((value) =>  formatDate(value, formatString))
))