import { z } from "zod";
import { zFile, zFiles } from "../../openapi/zod-extend";

export const uploadSchema = z.object({ filer: zFile(), avatar: zFile(), multipleFiles: zFiles() }) 

export type UploadSchema = z.infer<typeof uploadSchema>
