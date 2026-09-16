export interface Radius {
    id: string
    value: string
}

const radii: Radius[] = [
    { id: 'none', value: '0' },
    { id: 'sm', value: '0.375rem' },
    { id: 'md', value: '0.625rem' },
    { id: 'xl', value: '0.875rem' },
    { id: '2xl', value: '1.25rem' },
]

export function useRadii() {
    return radii
}
