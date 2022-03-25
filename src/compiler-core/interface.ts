interface IOptions {
  delimiters: string[],
  isVoidTag: (tag: string) => boolean,
  isNativeTag: (tag: string) => boolean,
}

export interface Context {
  options: IOptions,
  source: string,
}