const DefineRouteRoots = {
  auth: '/auth',
  user: '/users',
  healthcheck: '/healthcheck',
  upload: '/upload',
} as const;

export type RouteRootsType<
  K extends keyof typeof DefineRouteRoots = keyof typeof DefineRouteRoots,
> = Record<Uppercase<K>, (typeof DefineRouteRoots)[K]>;

const RouteRoots = Object.fromEntries(
  Object.entries(DefineRouteRoots).map(([key, value]) => {
    return [key.toUpperCase(), value];
  }),
) as RouteRootsType;

export default RouteRoots;
