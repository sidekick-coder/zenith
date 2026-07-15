import { EmmitterService } from '@sidekick-coder/zenith-kit/shared'
import DashboardWidgetData from './DashboardWidgetData'
import DashboardWidget from './DashboardWidget'
import DashboardWidgetDefinition from './DashboardWidgetDefinition'
import DashboardWidgetDefinitionUnknown from './DashboardWidgetDefinitionUnknown'
import type { DashboardSchema } from '#shared/schemas/index.ts'
import type { Widget } from '#client/components/DashboardWidget.vue'
import dashboardRegistry from '#client/facades/dashboardRegistry.ts'

export interface DashboardOptions {
    dashboard: DashboardSchema
    widgets?: DashboardWidgetData[]
}

export default class Dashboard {
    public name: DashboardSchema['name'] = ''
    public description: DashboardSchema['description'] = ''
    public widgets: DashboardWidget[] = []
    public emmitter: EmmitterService
    public containerWidth: number = 0

    constructor() {
        this.emmitter = new EmmitterService()
    }

    public setName(name: string) {
        this.name = name
        return this
    }

    public setDescription(description: string) {
        this.description = description
        return this
    }

    public setContainerWidth(width: number) {
        this.containerWidth = width
        return this
    }

    public setWidgets(widgets: DashboardWidgetData[]) {

        this.widgets = []

        for (const w of widgets) {
            const widget = DashboardWidget.fromData(w)

            widget.setEmmitter(this.emmitter)

            this.widgets.push(widget)
        }

        return this
    }

    private reindex(widgets: Widget[]): Widget[] {
        return widgets.map((w, i) => ({
            ...w,
            order: i
        }))
    }

    public findLastRow(): number {
        let result = 0 

        for (const widget of this.widgets) {
            const rows = widget.rows?.base ?? 0
            const y = widget.y?.base ?? 0

            const bottom = y + rows

            if (bottom > result) {
                result = bottom
            }
        }
        
        return result

    }

    public addWidget(payload: Partial<DashboardWidgetData> = {}) {
        if (!payload.columns) {
            payload.columns = { base: 4, }
        }

        if (!payload.rows) {
            payload.rows = { base: 4, }
        }

        if (!payload.x) {
            payload.x = { base: 0, }
        }

        if (!payload.y) {
            payload.y = { base: this.findLastRow(), }
        }

        const data = new DashboardWidgetData(payload)

        const widget = DashboardWidget.fromData(data)

        widget.setEmmitter(this.emmitter)

        this.widgets.push(widget)
    }

    public removeWidget(index: number) {
        this.widgets = this.reindex(this.widgets.filter((_, i) => i !== index))
    }

    public updateWidget(index: number, widget: Widget) {
        this.widgets = this.widgets.map((w, i) => i === index ? widget : w)
    }

    public updateWidgetById(id: string, widget: Partial<DashboardWidgetData>) {
        const index = this.widgets.findIndex(w => w.id === id)

        if (index === -1) return

        const original = this.widgets[index]

        const updated = {
            ...original,
            ...widget
        }

        this.widgets[index] = updated
    }

    public duplicateWidget(index: number) {
        const copy: Widget = JSON.parse(JSON.stringify(this.widgets[index]))
        const updated = [...this.widgets]
        updated.splice(index + 1, 0, copy)
        this.widgets = this.reindex(updated)
    }

    public reorder(fromIndex: number, toIndex: number) {
        if (toIndex < 0 || toIndex >= this.widgets.length) return
        const updated = [...this.widgets]
        const [item] = updated.splice(fromIndex, 1)
        updated.splice(toIndex, 0, item)
        this.widgets = this.reindex(updated)
    }

    public moveUp(index: number) {
        this.reorder(index, index - 1)
    }

    public moveDown(index: number) {
        this.reorder(index, index + 1)
    }

    // public setWidgets(widgets: Widget[]) {
    //     this.widgets = this.reindex(widgets)
    // }
}
