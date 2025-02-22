import { canAccess } from "../../middlewares/can-access.middleware";
import MagicRouter from "../../openapi/magic-router";
import {
	handleCreateSuperAdmin,
	handleCreateUser,
	handleGetUsers,
} from "./user.controller";
import { createUserSchema, getUsersSchema } from "./user.schema";

export const USER_ROUTER_ROOT = "/users";

const userRouter = new MagicRouter(USER_ROUTER_ROOT);

userRouter.get(
	"/",
	{
		requestType: { query: getUsersSchema },
	},
	canAccess(),
	handleGetUsers,
);

userRouter.post(
	"/user",
	{ requestType: { body: createUserSchema } },
	canAccess("roles", ["SUPER_ADMIN"]),
	handleCreateUser,
);

userRouter.post("/_super-admin", {}, handleCreateSuperAdmin);

export default userRouter.getRouter();
