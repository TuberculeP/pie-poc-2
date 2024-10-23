import { Router } from "express";
import { googleRouter } from "./google.route";

const authRouter = Router();

authRouter.use("/google", googleRouter);

// /auth/me
authRouter.get("/me", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

export { authRouter };
