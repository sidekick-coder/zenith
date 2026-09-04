interface AssetStyle {
    src?: string
    content?: string
}

export default class AssetsService {
    private styles: Record<string, AssetStyle> = {}

    public set(name: string, style: AssetStyle) {
        this.styles[name] = style
    }

    public get(name: string): AssetStyle | null {
        return this.styles[name] || null
    }

    public getAll(): Record<string, AssetStyle> {
        return this.styles
    }
}