import MenuItem from '#client/entities/menuItem.entity.ts'
import acl from '#client/facades/acl.facade.ts'

export interface ListFilter {
    layout?: string
    group?: string
    parent?: string 
    allowed?: boolean
}

export default class MenuService {
    public items: Map<string, MenuItem> = new Map()

    public add(...item: Omit<MenuItem, 'merge' | 'from'>[]) {
        for (const i of item) {
            this.items.set(i.id, MenuItem.from(i))
        }
    }

    public remove(id: MenuItem['id']) {
        this.items.delete(id)
    }

    public list(filter: ListFilter = {}) {
        let items = Array.from(this.items.values())

        if (filter.layout) {
            items = items.filter(i => i.layout === filter.layout)
        }

        if (filter.group) {
            items = items.filter(i => i.group === filter.group || i.parent === filter.group)
        }

        if (filter.parent) {
            items = items.filter(i => i.parent === filter.parent)
        }

        if (filter.allowed !== undefined && filter.allowed === true) {
            items = items.filter(i => acl.can('view', i))
        }

        items.sort((a, b) => {
            const orderA = a.order ? a.order : 98
            const orderB = b.order ? b.order : 98

            return orderA - orderB
        })

        return items
    }
}
