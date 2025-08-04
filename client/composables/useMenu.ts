import {
    reactive, readonly, ref 
} from 'vue'

export interface MenuBase {
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

export interface MenuGroup {
    label: string;
    group: boolean;
    order?: number;
    items: MenuItem[];
}

export type MenuItem = MenuSingle | MenuWithChildren | MenuGroup;

export type UseMenu = ReturnType<typeof useMenu>

const items = ref<MenuItem[]>([])

export function useMenu() {
    function add(...item: MenuItem[]) {
        items.value.push(...item)
    }

    function remove(item: MenuItem) {
        const index = items.value.indexOf(item)

        if (index !== -1) {
            items.value.splice(index, 1)
        }
    }

    function clear() {
        items.value = []
    }

    return {
        items,
        add,
        remove,
        clear
    }
}