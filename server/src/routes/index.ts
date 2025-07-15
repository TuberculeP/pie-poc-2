import { Router } from "express";
import pg from "../config/db.config";
import { Foo } from "../config/entities/Foo";
import authRouter from "./auth";

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

export default router;
