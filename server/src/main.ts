import dotenv from "dotenv";
import express from "express";
import next from "next";
import path from "path";
import "./config";
import { pgConnect } from "./config/db.config";
import router from "./routes";

const dev = process.env.NODE_ENV !== "production";

dotenv.config({
  path: [
    path.resolve(__dirname, `${dev ? "../" : ""}../.env.local`),
    path.resolve(__dirname, `${dev ? "../" : ""}../.env`),
  ],
});

// Postgres

pgConnect();

const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();

server.use(express.json());
server.use("/public", express.static(path.join(__dirname, "public")));
server.use("/api", router);

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
