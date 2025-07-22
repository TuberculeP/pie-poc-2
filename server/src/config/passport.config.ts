import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import pg from "./db.config";
import bcrypt from "bcrypt";
import { User } from "./entities/User";
import _ from "lodash";

export default function initializePassport() {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async function verify(email, password, cb) {
        // Validate user
        if (!email || !password) {
          cb(null, false, { message: "All fields are required" });
          return;
        }

        const userRepository = pg.getRepository(User);
        const existingUser = await userRepository.findOne({ where: { email } });
        if (!existingUser) {
          cb(null, false, { message: "User not found" });
          return;
        }

        const isPasswordValid = bcrypt.compareSync(
          password,
          existingUser.password ?? "",
        );

        if (!isPasswordValid) {
          cb(null, false, { message: "Invalid credentials" });
          return;
        }

        cb(null, existingUser);
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await pg.getRepository(User).findOne({ where: { id } });
      if (!user) {
        return done(new Error("User not found"), false);
      }
      done(null, _.omit(user, "password"));
    } catch (err) {
      done(err, false);
    }
  });
}
