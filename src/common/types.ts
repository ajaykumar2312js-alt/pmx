export interface PaginationMeta {
  total: number;
  limit: number;
  nextCursor: string | null;
  prevCursor: string | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta: PaginationMeta | null;
}

export interface ApiErrorDetail {
  field: string | null;
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
  errors: ApiErrorDetail[];
}
