export interface GraphQl {
  query: string;
  variables?: Record<string, string>;
}

export type Api = <T>(data: GraphQl) => Promise<T>;
