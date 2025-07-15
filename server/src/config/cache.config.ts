// The configuration for the cache system, including Redis (prod) and SQLite (dev) session stores

import "dotenv/config";
import session from "express-session";
import * as sqlite3 from "sqlite3";
import sqliteStoreFactory from "express-session-sqlite";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

const DEFAULT_TLL = 60 * 60 * 24; // 1 day in seconds
const DEFAULT_PREFIX = "sess:";

// Will be used in app.use
export default function customSession() {
  const SqliteStore = sqliteStoreFactory(session);
  const redisClient = createClient();
  redisClient.connect().catch(console.error);

  const store =
    process.env.NODE_ENV === "production"
      ? new RedisStore({
          client: redisClient,
          prefix: DEFAULT_PREFIX,
          ttl: DEFAULT_TLL,
        })
      : new SqliteStore({
          driver: sqlite3.Database,
          path: "./express_session_local.db",
          ttl: DEFAULT_TLL,
          prefix: DEFAULT_PREFIX,
          cleanupInterval: 300000,
        });

  return session({
    secret: "you'll never guess this (poulet froid)",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store,
  });
}
