const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("./server");
const mongoose = require("mongoose");

let server;

// Setup: Start server & generate JWT
beforeAll(async () => {
  process.env.TEST_JWT = jwt.sign(
    { userId: "testUserId" },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  server = app.listen(0); 
});

describe("User Routes", () => {
  // GET all users
  test("GET /users should return all users", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // POST /users - Create new user
  test("POST /users should create a new user", async () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const newUser = {
      name: "John Doe",
      email: uniqueEmail,
      password: "securePassword123"
    };

    const response = await request(app)
      .post("/users")
      .send(newUser)
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty("_id");
    expect(response.body.user.name).toBe(newUser.name);
  });

  // POST /users - Fail with missing fields
  test("POST /users should fail with missing required fields", async () => {
    const invalidUser = { email: "incomplete@example.com" };

    const response = await request(app)
      .post("/users")
      .send(invalidUser)
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  // PUT /users/:id - Update a user
  test("PUT /users/:id should update a user", async () => {
    const createUserResponse = await request(app)
      .post("/users")
      .send({
        name: "Temp User",
        email: `temp_${Date.now()}@example.com`,
        password: "tempPass123"
      })
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(createUserResponse.status).toBe(201); 

    const userId = createUserResponse.body?.user?._id;
    if (!userId) {
      throw new Error("User ID is undefined. Cannot proceed.");
    }

    const updatedData = {
      name: "John Updated",
      email: `updated_${Date.now()}@example.com`,
      password: "updatedPass123"
    };

    const response = await request(app)
      .put(`/users/${userId}`)
      .send(updatedData)
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(response.status).toBe(200);
    expect(response.body.user.name).toBe(updatedData.name);
  });

  // DELETE /users/:id - Delete a user
  test("DELETE /users/:id should delete a user", async () => {
    const newUserResponse = await request(app)
      .post("/users")
      .send({
        name: "Temp User",
        email: `delete_${Date.now()}@example.com`,
        password: "tempPass123"
      })
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(newUserResponse.status).toBe(201); 

    const userId = newUserResponse.body?.user?._id;
    if (!userId) {
      throw new Error("User ID is undefined. Cannot delete.");
    }

    const response = await request(app)
      .delete(`/users/${userId}`)
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User deleted successfully");
  });
});

// Cleanup
afterAll(async () => {
  await mongoose.connection.close();
  await server.close();
  await new Promise(resolve => setTimeout(resolve, 0));
});
