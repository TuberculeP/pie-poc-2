import postgres from "pg";

let pg: postgres.Client;

function pgConnect() {
  const { POSTGRES_URL } = process.env;

  if (!POSTGRES_URL) {
    throw new Error(
      `Please provide all the required environment variables. Current env : \n ${process.env}`
    );
  }

  pg = new postgres.Client({
    connectionString: POSTGRES_URL,
  });

  pg.connect((err) => {
    if (err) {
      console.error("Connection error", err.stack);
    } else {
      console.log("Connected to the database");
    }
  });

  pg.on("end", () => {
    console.error("DATABASE CONNECTION ENDED. RETRYING IN 2 SECONDS...");
    setTimeout(pgConnect, 2000);
  });
}

export { pg, pgConnect };
