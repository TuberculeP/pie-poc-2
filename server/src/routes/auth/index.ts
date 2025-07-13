import { Router } from "express";
import { User } from "../../config/entities/User";
import pg from "../../config/db.config";
import bcrypt from "bcrypt";
import _ from "lodash";
import passport from "passport";


const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  // Validate user
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);

  const newUser = new User();

  newUser.firstName = firstName;
  newUser.lastName = lastName;
  newUser.email = email;
  newUser.password = hash;

  // Save user to the database
  const userRepository = pg.getRepository(User);
  const result = await userRepository.save(newUser);

  res.status(201).json({
    message: "User registered successfully",
    user: result,
  });
});

authRouter.post("/login", passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}
));

export default authRouter;
