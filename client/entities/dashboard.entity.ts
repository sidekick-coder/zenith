import type { DashboardSchema } from '#shared/schemas/index.ts'
import type { Widget } from '#client/components/DashboardWidget.vue'

export default class DashboardEntity {
    public dashboard: DashboardSchema
    public widgets: Widget[]

    constructor(dashboard: DashboardSchema, widgets: Widget[] = []) {
        this.dashboard = dashboard
        this.widgets = this.sortWidgets(widgets)
    }

    private sortWidgets(widgets: Widget[]) {
        return [...widgets].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    }

    private reindex(widgets: Widget[]): Widget[] {
        return widgets.map((w, i) => ({ ...w, order: i }))
    }

    public addWidget(widget: Widget = { cols: { base: 4 } }) {
        const order = this.widgets.length
        this.widgets = [...this.widgets, { ...widget, order }]
    }

    public removeWidget(index: number) {
        this.widgets = this.reindex(this.widgets.filter((_, i) => i !== index))
    }

    public updateWidget(index: number, widget: Widget) {
        this.widgets = this.widgets.map((w, i) => i === index ? widget : w)
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

    public setWidgets(widgets: Widget[]) {
        this.widgets = this.reindex(widgets)
    }
}
