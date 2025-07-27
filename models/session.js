import database from "infra/database";
import crypto from "node:crypto";

const EXPIRATION_IN_MILLESECONDS = 60 * 60 * 24 * 30 * 1000; // 30 Days

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const experiesAt = new Date(Date.now() + EXPIRATION_IN_MILLESECONDS);
  const newSession = await runInsertQuery(token, userId, experiesAt);
  return newSession;

  async function runInsertQuery(token, userId, experiesAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [token, userId, experiesAt],
    });
    return results.rows[0];
  }
}

const session = {
  create,
  EXPIRATION_IN_MILLESECONDS,
};

export default session;
