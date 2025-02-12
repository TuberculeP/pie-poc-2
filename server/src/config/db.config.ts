import { Pool, Client } from "pg";

const pgPool = new Pool({
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

let pgClient: Client;

async function pgConnect() {
  const { POSTGRES_URL } = process.env;

  if (!POSTGRES_URL) {
    throw new Error("Please provide all the required environment variables");
  }

  pgPool.options.connectionString = POSTGRES_URL;
  pgClient = new Client({
    connectionString: POSTGRES_URL,
  });

  pgPool.connect((err) => {
    if (err) {
      console.error("Connection error", err.stack);
    } else {
      console.log("> Connected to the database via pool");
    }
  });

  pgClient.connect((err) => {
    if (err) {
      console.error("Connection error", err.stack);
    } else {
      console.log("> Connected to the database via client");
    }
  });

  pgClient.on("error", (err) => {
    console.error("pgClient error", err.stack);
    console.info("Attempting to reconnect pgClient");
    pgConnect();
  });
}

export { pgPool as pg, pgClient, pgConnect };
