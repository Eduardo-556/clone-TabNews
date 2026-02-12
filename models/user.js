import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors";
import password from "./password";

async function findOneById(id) {
  const userFound = await runSelectorQuery(id);

  return userFound;

  async function runSelectorQuery(id) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          id = $1
        LIMIT
          1                
        ;`,
      values: [id],
    });

    if (result.rowCount == 0) {
      throw new NotFoundError({
        message: "O ID informado não foi encontrado no sistema.",
        action: "verifique se o ID está digitado corretamente.",
      });
    }

    return result.rows[0];
  }
}
async function findOneByUsername(username) {
  const userFound = await runSelectorQuery(username);

  return userFound;

  async function runSelectorQuery(username) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1                
        ;`,
      values: [username],
    });

    if (result.rowCount == 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema.",
        action: "verifique se o username está digitado corretamente.",
      });
    }

    return result.rows[0];
  }
}

async function findOneByEmail(email) {
  const userFound = await runSelectorQuery(email);

  return userFound;

  async function runSelectorQuery(email) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        LIMIT
          1                
        ;`,
      values: [email],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O email informado não foi encontrado no sistema.",
        action: "verifique se o email está digitado corretamente.",
      });
    }

    return result.rows[0];
  }
}

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  await hashPasswordInObject(userInputValues);
  injectDeafaultFeaturesInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const result = await database.query({
      text: `
        INSERT INTO 
          users (username, email, password, features) 
        VALUES 
          ($1, $2, $3, $4)
        RETURNING
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
        userInputValues.features,
      ],
    });
    return result.rows[0];
  }

  function injectDeafaultFeaturesInObject(userInputValues) {
    userInputValues.features = ["read:activation_token"];
  }
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }
  const userWithNewValues = { ...currentUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const results = await database.query({
      text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())  
      WHERE
        id = $1
      RETURNING
        *
      `,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    });

    return results.rows[0];
  }
}

async function validateUniqueUsername(username) {
  const result = await database.query({
    text: `
        SELECT
          username
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)                
        ;`,
    values: [username],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O usuário  informado já está sendo utilizado.",
      action: "Utilize outro nome de usuário para realizar está operação",
    });
  }
}

async function validateUniqueEmail(email) {
  const result = await database.query({
    text: `
        SELECT
          email
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)                
        ;`,
    values: [email],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar está operação",
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

async function setFeatures(userId, features) {
  const updateUser = await runUpdateQuery(userId, features);
  return updateUser;

  async function runUpdateQuery(userId, features) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          features = $2,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [userId, features],
    });

    return results.rows[0];
  }
}

async function addFeatures(userId, features) {
  const updateUser = await runUpdateQuery(userId, features);
  return updateUser;

  async function runUpdateQuery(userId, features) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          features = array_cat(features, $2),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [userId, features],
    });

    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
  update,
  findOneByEmail,
  findOneById,
  setFeatures,
  addFeatures,
};

export default user;
