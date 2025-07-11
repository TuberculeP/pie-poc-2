import "reflect-metadata";
import "dotenv/config";
import pg from "./config/db.config";
import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
import { Server as WSServer } from "socket.io";
import { registerWebsocketListeners } from "./events/event_handler";
import router from "./routes";

const main = async () => {
  const dev = process.env.NODE_ENV !== "production";

  const app = express();
  const server = createHttpServer(app);
  app.use(express.json());
  app.use("/api", router);

  const vite = await createViteServer();

  if (dev) {
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "./client")));
  }

  app.use(async (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
    } else {
      if (dev) {
        vite.middlewares(req, res, next);
      } else {
        res.sendFile(path.resolve(__dirname, "./client/index.html"));
      }
    }
  });

  app.use("/public", express.static(path.join(__dirname, "public")));

  // WebSocket server
  const wss = new WSServer(server);
  registerWebsocketListeners(wss);

  server.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
};

// start typeorm migration and server
(async () => {
  await pg.initialize();
  await pg.runMigrations();
  await main();
})();
