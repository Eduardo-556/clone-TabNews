import database from "infra/database";
import { UnauthorizedError } from "infra/errors";
import crypto from "node:crypto";

const EXPIRATION_IN_MILLESECONDS = 60 * 60 * 24 * 30 * 1000; // 30 Days

async function findOneValidByToken(sessionToken) {
  const sessionFound = await runSelectQuery(sessionToken);
  return sessionFound;

  async function runSelectQuery(sessionToken) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM
          sessions
        WHERE
          token = $1
          AND expires_at > NOW()
        LIMIT
          1
      ;`,
      values: [sessionToken],
    });

    if (result.rowCount == 0) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente",
      });
    }
    return result.rows[0];
  }
}

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

async function renew(sessionId) {
  const experiesAt = new Date(Date.now() + EXPIRATION_IN_MILLESECONDS);
  const renewedSessionObject = runUpdateQuery(sessionId, experiesAt);
  return renewedSessionObject;

  async function runUpdateQuery(sessionId, experiesAt) {
    const result = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = $2,
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING
         *
      ;`,
      values: [sessionId, experiesAt],
    });

    return result.rows[0];
  }
}

async function expireById(sessionId) {
  const expiredSessionObject = await runUpdateQuery(sessionId);
  return expiredSessionObject;

  async function runUpdateQuery(sessionId) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = expires_at - interval '1 year',
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [sessionId],
    });
    return results.rows[0];
  }
}

const session = {
  create,
  EXPIRATION_IN_MILLESECONDS,
  findOneValidByToken,
  renew,
  expireById,
};

export default session;
