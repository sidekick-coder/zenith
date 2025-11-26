import { ref } from 'vue'

export interface MenuBase {
    id: string
    label: string;
    order?: number;
}

export interface MenuSingle  extends MenuBase {
    icon: string;
    to: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
}

export interface MenuWithChildren extends MenuBase {
    icon: string;
    children: Omit<MenuSingle, 'icon'>[];
}

export interface MenuGroup extends MenuBase {
    group: boolean;
    items: MenuItem[];
}

export interface MenuItem {
    id: string
    label: string;
    to?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    group?: string
    order?: number;
    icon?: string
    parent?: string
}

export type UseMenu = ReturnType<typeof useMenu>

const items = ref<MenuItem[]>([])

export function useMenu() {
    function add(...item: MenuItem[]) {
        items.value.push(...item)
    }

    function remove(item: MenuItem | MenuItem['id']) {
        let index = -1

        if (typeof item === 'string') {
            index = items.value.findIndex(i => i.id === item)
        }

        if (index === -1) {
            index = items.value.indexOf(item as MenuItem)
        }

        if (index !== -1) {
            items.value.splice(index, 1)
        }
    }

    function removeGroup(groupId: string) {
        items.value = items.value.filter(i => i.group !== groupId)
    }

    function removeMany(itemIds: string[]) {
        itemIds.forEach(id => remove(id))
    }

    function removeManyGroup(groupIds: string[]) {
        console.log('removeManyGroup', groupIds)
        groupIds.forEach(id => removeGroup(id))
    }

    function clear() {
        items.value = []
    }

    return {
        items,
        add,
        remove,
        removeGroup,
        removeMany,
        removeManyGroup,
        clear
    }
}