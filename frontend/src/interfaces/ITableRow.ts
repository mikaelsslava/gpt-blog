export interface ITableRow {
    id: number
    topic: string
    article: string,
    model: string,
    prompt: string,
    maxTokens: number,
    published_wf: number, // 0 or 1
    published_li: number, // 0 or 1
    published_fb: number, // 0 or 1
}