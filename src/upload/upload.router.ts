import { Router } from "express";
import { canAccess } from "../middlewares/can-access.middleware";
import { uploadProfile } from "../middlewares/multer-s3.middleware";
import { handleProfileUpload } from "./upload.controller";

export const UPLOAD_ROUTER_ROOT = "/upload";

const uploadRouter = Router();

uploadRouter.post("/profile", canAccess(), uploadProfile, handleProfileUpload);

export default uploadRouter;
