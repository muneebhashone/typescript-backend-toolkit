import RedisStore from "connect-redis";
import redisClient from "./redis.server";

const redisStore = new RedisStore({
	client: redisClient,
});

export default redisStore;
