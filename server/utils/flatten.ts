export function flatten(obj, prefix = '', res = {}): Record<string, any> {
    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            flatten(value, newKey, res)
        } else {
            res[newKey] = value
        }
    }
    return res
}

export function unflatten(obj): Record<string, any> {
    const result = {}
    for (const [key, value] of Object.entries(obj)) {
        const parts = key.split('.')
        let current = result
        parts.forEach((part, i) => {
            if (i === parts.length - 1) {
                current[part] = value
            } else {
                if (!current[part] || typeof current[part] !== 'object') {
                    current[part] = {}
                }
                current = current[part]
            }
        })
    }
    return result
}