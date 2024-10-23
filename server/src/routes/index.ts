import { Router } from "express";
import { getAllFooBars } from "../domains/fooBar/fooBar.service";
import { authRouter } from "./auth";
import { PgUser } from "../../../types/users";
import routeSecured from "../middlewares/routeSecured.middleware";

const router = Router();

// test route
router.get("/api/foo-bar", async (req, res) => {
  const results = await getAllFooBars();
  res.json(results);
});

// test securedRouter
const securedRouter = Router();
securedRouter.use(routeSecured);

securedRouter.get("/", async (req, res) => {
  const user = req.user as PgUser;
  res.json({ message: `Hello ${user.first_name}!` });
});

router.use("/api/secured", securedRouter);

// auth routes
router.use("/auth", authRouter);

export default router;
