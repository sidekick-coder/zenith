import type DashboardWidgetDefinition from '#client/entities/DashboardWidgetDefinition.ts'

export default class DashboardWidgetRegistry {
    private definitions: Map<string, DashboardWidgetDefinition> = new Map()

    public register(definition: DashboardWidgetDefinition) {
        this.definitions.set(definition.id, definition)

        console.log(definition)
    }

    public get(id: string): DashboardWidgetDefinition | null {
        return this.definitions.get(id) || null
    }
}
