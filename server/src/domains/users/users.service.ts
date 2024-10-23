import { Profile } from "passport";
import { pg } from "../../config/db.config";
import type { PgUser } from "../../../../types/users";

async function findOrCreateUser(profile: Profile): Promise<PgUser> {
  // check if user exists
  const { rows } = await pg.query<PgUser>(
    `SELECT * FROM users WHERE google_id = $1`,
    [profile.id]
  );
  if (rows.length) {
    return rows[0];
  }
  // else create one from profile with display name as pseudo
  const { id, name, photos } = profile;
  const { familyName, givenName } = name || {};
  const { value: picture_url } = photos?.[0] || { value: null };
  const { rows: newRows } = await pg.query<PgUser>(
    `INSERT INTO users (google_id, first_name, last_name, picture_url) VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, givenName, familyName, picture_url]
  );
  return newRows[0];
}

async function findById(id: string): Promise<PgUser> {
  console.log(
    "\x1b[44m%s\x1b[0m",
    "server/src/domains/users/users.service.ts:26 id",
    id
  );
  const { rows } = await pg.query<PgUser>(`SELECT * FROM users WHERE id = $1`, [
    id,
  ]);
  return rows[0];
}

const usersService = { findOrCreateUser, findById };

export default usersService;
