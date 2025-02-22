export type GetPaginatorReturnType = {
	skip: number;
	limit: number;
	currentPage: number;
	pages: number;
	hasNextPage: boolean;
	totalRecords: number;
	pageSize: number;
};

export const getPaginator = (
	limitParam: number,
	pageParam: number,
	totalRecords: number,
): GetPaginatorReturnType => {
	let skip = pageParam;
	const limit = limitParam;

	if (pageParam <= 1) {
		skip = 0;
	} else {
		skip = limit * (pageParam - 1);
	}

	const currentPage = Math.max(1, pageParam as number);

	const pages = Math.ceil(totalRecords / Number(limit));

	const hasNextPage = pages > currentPage;

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
