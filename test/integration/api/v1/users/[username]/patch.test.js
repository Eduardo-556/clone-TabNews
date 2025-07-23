import password from "models/password";
import user from "models/user";
import orchestrator from "test/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistent",
        {
          method: "PATCH",
        },
      );
      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "verifique se o username está digitado corretamente.",
        statusCode: 404,
      });
    });
    test("With duplicated 'username'", async () => {
      const user1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "user1",
          email: "user1@email.com",
          password: "password123",
        }),
      });
      expect(user1.status).toBe(201);

      const user2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "user2",
          email: "user2@email.com",
          password: "password123",
        }),
      });
      expect(user2.status).toBe(201);

      const user2Update = await fetch(
        "http://localhost:3000/api/v1/users/user2",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "user1",
          }),
        },
      );

      expect(user2Update.status).toBe(400);

      const response = await user2Update.json();

      expect(response).toEqual({
        name: "ValidationError",
        message: "O usuário  informado já está sendo utilizado.",
        action: "Utilize outro nome de usuário para realizar está operação",
        statusCode: 400,
      });
    });
    test("With duplicated 'email'", async () => {
      const email1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "email1",
          email: "email1@email.com",
          password: "password123",
        }),
      });
      expect(email1.status).toBe(201);

      const email2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "email2",
          email: "email2@email.com",
          password: "password123",
        }),
      });
      expect(email2.status).toBe(201);

      const email2Update = await fetch(
        "http://localhost:3000/api/v1/users/email2",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "email1@email.com",
          }),
        },
      );

      expect(email2Update.status).toBe(400);

      const response = await email2Update.json();

      expect(response).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar está operação",
        statusCode: 400,
      });
    });
    test("With unique 'username'", async () => {
      const uniqueUser1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "uniqueUser1",
          email: "uniqueUser1@email.com",
          password: "password123",
        }),
      });
      expect(uniqueUser1.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        email: "uniqueUser1@email.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
    test("With unique 'email'", async () => {
      const uniqueUser1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "uniqueEmail1",
          email: "uniqueemail1@email.com",
          password: "password123",
        }),
      });
      expect(uniqueUser1.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "uniqueemail2@email.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueEmail1",
        email: "uniqueemail2@email.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
    test("With new 'password'", async () => {
      const uniqueUser1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "newPassword",
          email: "newPassword@email.com",
          password: "newPassword1",
        }),
      });
      expect(uniqueUser1.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/newpassword",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "newPassword",
        email: "newPassword@email.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("newPassword");
      const correctPasswordMatch = await password.compare(
        "newPassword2",
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "newPassword1",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toEqual(true);
      expect(incorrectPasswordMatch).toEqual(false);
    });
  });
});
