import { createId } from '@sidekick-coder/zenith-kit/shared'

interface GridUnit {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
}

export default class DashboardWidgetData {
    public id: string
    public name: string
    public definition_id: string
    public columns: GridUnit 
    public rows: GridUnit
    public x: GridUnit
    public y: GridUnit
    public order: number

    constructor(data: Partial<DashboardWidgetData>) {
        Object.assign(this, data)

        if (!this.id) {
            this.id = createId()
        }
    }
}
