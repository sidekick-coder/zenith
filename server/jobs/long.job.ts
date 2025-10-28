import Job from '#server/entities/job.entity.ts'

export default class LongJob extends Job {
    public async handle(data: any) {
        console.log('start', data)

        await new Promise((resolve) => setTimeout(resolve, 10000))

        console.log('end')

    }
}