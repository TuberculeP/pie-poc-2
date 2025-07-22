import { Router } from "express";
import authRouter from "./auth";
import sharedRouter from "./shared";

const router = Router();

router.get("/", (_, res) => {
  res.json({
    message: "Hello from the server!",
  });
});

router.use("/auth", authRouter);
router.use("/shared", sharedRouter);

export default router;
