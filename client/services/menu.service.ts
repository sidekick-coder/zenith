import { useRoute } from 'vue-router'
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

    public add(...item: Omit<Partial<MenuItem>, 'merge' | 'from'>[]) {
        for (const i of item) {

            if (!i.id) {
                i.id = JSON.stringify(i)
            }

            this.items.set(i.id, MenuItem.from(i))
        }
    }

    public remove(id: MenuItem['id']) {
        this.items.delete(id)
    }

    public list(filter: ListFilter = {}) {
        let items = JSON.parse(JSON.stringify(Array.from(this.items.values()))) as MenuItem[]
        
        const route = useRoute()

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

        for (const item of items) {
            const params = item.params || {}
            // check current route and replace parameters in to
            for (const key in params) {
                if (item.to) {
                    item.to = item.to.replace(`:${key}`, String(route.params[key]))
                }

                if (item.toFn) {
                    item.to = item.toFn({ route })
                }
            }
        }

        return items
    }
}
