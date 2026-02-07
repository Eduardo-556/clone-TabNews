import { InternalServerError } from "infra/errors.js";

const availableFeatures = [
  // USER
  "create:user",
  "read:user",
  "read:user:self",
  "update:user",
  "update:user:others",

  // SESSION
  "create:session",
  "read:session",

  // ACTIVATION_TOKEN
  "read:activation_token",

  // MIGRATION
  "create:migration",
  "read:migration",

  // STATUS
  "read:status",
  "read:status:all",
];

function can(user, feature, resource) {
  validateUser(user);
  validateFeature(feature);
  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  if (feature === "update:user" && resource) {
    authorized = false;

    if (user.id === resource.id || can(user, "update:user:others")) {
      authorized = true;
    }
  }

  return authorized;
}

function filterOutput(user, feature, output) {
  validateUser(user);
  validateFeature(feature);
  validateResource(output);

  if (feature === "read:user") {
    return {
      id: output.id,
      username: output.username,
      features: output.features,
      created_at: output.created_at,
      updated_at: output.updated_at,
    };
  }

  if (feature === "read:user:self") {
    if (user.id === output.id) {
      return {
        id: output.id,
        username: output.username,
        email: output.email,
        features: output.features,
        created_at: output.created_at,
        updated_at: output.updated_at,
      };
    }
  }

  if (feature === "read:session") {
    if (user.id === output.user_id) {
      return {
        id: output.id,
        token: output.token,
        user_id: output.user_id,
        created_at: output.created_at,
        updated_at: output.updated_at,
        expires_at: output.expires_at,
      };
    }
  }

  if (feature === "read:activation_token") {
    return {
      id: output.id,
      user_id: output.user_id,
      created_at: output.created_at,
      updated_at: output.updated_at,
      expires_at: output.expires_at,
      used_at: output.used_at,
    };
  }

  if (feature === "read:migration") {
    return output.map((migration) => {
      return {
        path: migration.path,
        name: migration.name,
        timestamp: migration.timestamp,
      };
    });
  }

  if (feature === "read:status") {
    const outputStatus = {
      updated_at: output.updated_at,
      dependencies: {
        database: {
          max_connections: output.dependencies.database.max_connections,
          opened_connections: output.dependencies.database.opened_connections,
        },
      },
    };

    if (can(user, "read:status:all")) {
      outputStatus.dependencies.database.version =
        output.dependencies.database.version;
    }
    return outputStatus;
  }
}

function validateUser(user) {
  if (!user || !user.features) {
    throw new InternalServerError({
      cause: "É necessário fornecer `user` no model `authorization`.",
    });
  }
}

function validateFeature(feature) {
  if (!feature || !availableFeatures.includes(feature)) {
    throw new InternalServerError({
      cause:
        "É necessário fornecer uma `feature` conhecida no model `authorization`.",
    });
  }
}

function validateResource(resource) {
  if (!resource) {
    throw new InternalServerError({
      cause:
        "É necessário fornecer um `resource` em `authorization.filterOutput()`.",
    });
  }
}

const authorization = {
  can,
  filterOutput,
};

export default authorization;
