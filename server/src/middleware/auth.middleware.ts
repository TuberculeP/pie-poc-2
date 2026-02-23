import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if the user is authenticated
 */
export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
};

/**
 * Middleware to check if the authenticated user has admin role
 * Must be used after isAuth middleware
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "ROLE_ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
};
