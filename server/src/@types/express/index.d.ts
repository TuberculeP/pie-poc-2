import "express";
import type { User as MyUser } from "../../config/entities/User";

declare global {
  namespace Express {
    interface User extends MyUser {
      password?: string;
    }
  }
}
