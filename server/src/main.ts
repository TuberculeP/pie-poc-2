import dotenv from "dotenv";
import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
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

async function init() {
  // Express.js initialization
  const app = express();
  const server = createHttpServer(app);
  app.use(express.json());

  if (dev) {
    // Vite.js initialization
    const vite = await createViteServer();
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "./client")));
  }

  // Express.js routing
  app.use("/public", express.static(path.join(__dirname, "public")));
  app.use(router);

  server.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
}

init();
