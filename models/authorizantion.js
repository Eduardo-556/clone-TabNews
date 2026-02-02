function can(user, feature, resource) {
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
          max_connections: output.max_connections,
          opened_connections: output.opened_connections,
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

const authorization = {
  can,
  filterOutput,
};

export default authorization;
