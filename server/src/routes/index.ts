import { Router } from "express";
import pg from "../config/db.config";
import { Foo } from "../config/entities/Foo";

const router = Router();

router.get("/", (_, res) => {
  const fooRepository = pg.getRepository(Foo);
  const foos = fooRepository.find();
  res.json({
    message: "Hello from the server!",
    foos,
  });
});

export default router;
