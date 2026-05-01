export interface IPageResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalPage: number;
  totalItem: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: T[];
}
