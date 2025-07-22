import { Router } from "express";
import uploadsRouter from "./uploads";

const sharedRouter = Router();

sharedRouter.use("/uploads", uploadsRouter);

export default sharedRouter;
