import Table from 'cli-table3'

interface TableColumn {
    label: string
    value: string | ((item: any) => string)
    width?: number
    realWidth?: number
}

export class UI {
    public table(items: any[], columns?: TableColumn[]) {
        const screenWidth = (process.stdout.columns || 80) - 6
        const rows = [] as string[][]
        const head: TableColumn[] = []

        if (columns) {
            head.push(...columns)
        }

        if (!columns) {
            items.map((item: any) => Object.keys(item))
                .flat()
                .filter((value, index, self) => self.indexOf(value) === index)
                .forEach((key) => {
                    head.push({
                        label: key,
                        value: key,
                    })
                })
        }

        items.forEach((item: any) => {
            const row = [] as string[]

            head.forEach((h) => {
                let value = ''

                if (typeof h.value === 'function') {
                    value = h.value(item)
                }

                if (typeof h.value === 'string') {
                    value = item[h.value]
                }

                if (value === undefined || value === null) {
                    value = ''
                }

                if (typeof value === 'object' || Array.isArray(value)) {
                    value = JSON.stringify(value)
                }
                
                row.push(value)
            })

            rows.push(row)
        })

        head.forEach((h) => {
            if (h.width) {
                h.width = Number(h.width)
            }

            if (!h.label) {
                h.label = String(h.value)
            }
        })

        const usedWidth = head.filter((h) => !!h.width).reduce((acc, h) => acc + h.width!, 0)
        const remainingWidth = 100 - usedWidth
        const withNoWidth = head.filter((h) => !h.width).length

        head.forEach((h) => {
            if (!h.width) {
                h.width = Math.floor(remainingWidth / withNoWidth)
            }
        })

        head.forEach((h) => {
            if (h.width) {
                h.realWidth = Math.floor(screenWidth * (h.width / 100))
            }
        })

        const table = new Table({
            head: head.map((h) => h.label),
            style: {
                head: [], //disable colors in header cells
                border: [], //disable colors for the border
            },
            wordWrap: true,
            wrapOnWordBoundary: false,
            colWidths: head.map((h) => h.realWidth) as number[],
        })

        table.push(...rows)

        console.log(table.toString())
    }
}

export class CLIService {
    public ui: UI

    constructor() {
        this.ui = new UI()
    }
}

const cli = new CLIService()

export default cli
