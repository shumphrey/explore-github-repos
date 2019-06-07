export interface PageInfo {
  endCursor?: string;
  hasNextPage: boolean;
}

export interface Nodes<T> {
  nodes: T[];
}

export interface Node<T> {
  node: T;
}

export interface Result<T> {
  totalCount: number;
  edges: Node<T>[];
  pageInfo: PageInfo;
}
