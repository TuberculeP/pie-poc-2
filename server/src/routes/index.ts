import { Router } from "express";
import pg from "../config/db.config";
import { Foo } from "../config/entities/Foo";
import authRouter from "./auth";
import postsRouter from "./network/posts";
import tagsRouter from "./network/tags";
import messagesRouter from "./network/messages";
import appRouter from "./app";

const router = Router();

router.get("/", (_, res) => {
  const fooRepository = pg.getRepository(Foo);
  const foos = fooRepository.find();
  res.json({
    message: "Hello from the server!",
    foos,
  });
});

router.use("/auth", authRouter);
router.use("/posts", postsRouter);
router.use("/tags", tagsRouter);
router.use("/messages", messagesRouter);
router.use("/app", appRouter);

export default router;
