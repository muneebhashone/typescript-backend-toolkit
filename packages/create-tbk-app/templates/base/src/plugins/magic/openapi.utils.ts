export const parseRouteString = (route?: string): string => {
	return (route ?? "").replace(/\/:(\w+)/g, "/{$1}");
};

export const routeToClassName = (route?: string): string => {
	const cleanedRoute = (route ?? "").replace(/^\/|\/$/g, "");

	const className =
		cleanedRoute.charAt(0).toUpperCase() + cleanedRoute.slice(1).toLowerCase();

	return className.endsWith("s") ? className.slice(0, -1) : className;
};

export const camelCaseToTitleCase = (input?: string): string => {
	let titleCase = (input ?? "")
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase())
		.trim();

	if (titleCase.split(" ")[0] === "Handle") {
		titleCase = titleCase.slice(6);
	}

	return titleCase;
};
