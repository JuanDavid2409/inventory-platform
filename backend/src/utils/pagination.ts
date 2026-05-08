export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const buildPagination = (
  total: number,
  page: number,
  limit: number
): PaginatedResponse<never>['pagination'] => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

// Función genérica que preserva los tipos adicionales
export const parsePagination = <T extends PaginationParams>(params: T) => {
  const page = Math.max(1, parseInt(String(params.page || 1), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(params.limit || 20), 10) || 20));
  const search = params.search ? String(params.search).trim() : undefined;
  
  // Extraer page, limit y search, y devolver el resto
  const { page: _page, limit: _limit, search: _search, ...rest } = params as any;

  return { 
    page, 
    limit, 
    search, 
    ...rest 
  } as typeof rest & { 
    page: number; 
    limit: number; 
    search?: string 
  };
};