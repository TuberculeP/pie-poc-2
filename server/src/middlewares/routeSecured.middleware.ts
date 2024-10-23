import type { NextFunction, Request, Response } from "express";

const routeSecured = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
  } else next();
};

export default routeSecured;
