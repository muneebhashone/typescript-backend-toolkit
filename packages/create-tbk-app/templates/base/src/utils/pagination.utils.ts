export type GetPaginatorReturnType = {
  skip: number;
  limit: number;
  currentPage: number;
  pages: number;
  hasNextPage: boolean;
  totalRecords: number;
  pageSize: number;
};

/**
 * Calculate pagination metadata
 * @param limitParam - Number of items per page
 * @param pageParam - Current page number (1-indexed)
 * @param totalRecords - Total number of records
 * @returns Pagination metadata including skip, limit, pages, etc.
 */
export const getPaginator = (
  limitParam: number,
  pageParam: number,
  totalRecords: number,
): GetPaginatorReturnType => {
  // Ensure positive limit with fallback
  const limit = Math.max(1, limitParam || 10);

  // Ensure page is at least 1
  const currentPage = Math.max(1, pageParam || 1);

  // Calculate skip based on current page
  const skip = (currentPage - 1) * limit;

  // Calculate total pages
  const pages = Math.ceil(totalRecords / limit);

  // Check if there's a next page
  const hasNextPage = currentPage < pages;

  return {
    skip,
    limit,
    currentPage,
    pages,
    hasNextPage,
    totalRecords,
    pageSize: limit,
  };
};
