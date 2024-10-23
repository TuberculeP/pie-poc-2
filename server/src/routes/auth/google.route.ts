import { Router } from "express";
import passport from "passport";

const googleRouter = Router();

googleRouter.get("/", passport.authenticate("google", { scope: ["profile"] }));

googleRouter.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect front-end home.
    const { EXPRESS_URL } = process.env;
    if (!EXPRESS_URL) {
      throw new Error("Please provide all the required environment variables");
    }
    res.redirect(EXPRESS_URL);
  }
);

export { googleRouter };
