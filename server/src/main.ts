import dotenv from "dotenv";
import path from "path";
import express from "express";
import next from "next";
import { pgConnect } from "./config/db.config";
import router from "./routes";

// Load environment variables
const dev = process.env.NODE_ENV !== "production";
dotenv.config({
  path: [
    path.resolve(__dirname, `${dev ? "../" : ""}../.env.local`),
    path.resolve(__dirname, `${dev ? "../" : ""}../.env`),
  ],
});

// Init all configs
pgConnect();

// Next.js initialization
const app = next({ dev });
const handle = app.getRequestHandler();

// Express.js initialization
const server = express();
server.use(express.json());

// Express.js routing
server.use("/public", express.static(path.join(__dirname, "public")));
server.use(router);

// Start the server
app.prepare().then(() => {
  // Express.js routes and middleware go here
  server.get("/api/custom-route", (req, res) => {
    res.json({ message: "This is a custom API route." });
  });

  // nextjs
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
});
