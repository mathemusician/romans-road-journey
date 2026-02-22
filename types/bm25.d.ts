declare module 'bm25' {
  export default class BM25 {
    constructor(corpus: string[][], options?: { k1?: number; b?: number });
    search(query: string[]): number[];
  }
}
