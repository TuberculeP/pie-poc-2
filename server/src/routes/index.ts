import { Router } from "express";
import { getAllFooBars } from "../domains/fooBar/fooBar.service";

const router = Router();

router.get("/foo-bar", async (req, res) => {
  const results = await getAllFooBars();
  res.json(results);
});

export default router;
