import { Router } from "express";
import pg from "../config/db.config";
import { Foo } from "../config/entities/Foo";
import postsRouter from "./network/posts";

const router = Router();

router.get("/", (_, res) => {
  const fooRepository = pg.getRepository(Foo);
  const foos = fooRepository.find();
  res.json({
    message: "Hello from the server!",
    foos,
  });
});

router.use("/posts", postsRouter);

export default router;
