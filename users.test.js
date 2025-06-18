const jwt = require("jsonwebtoken");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./server");

process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "testsecret";
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/testdb";

let server;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Ensure connection is stable before starting tests
  let retries = 5;
  while (mongoose.connection.readyState !== 1 && retries > 0) {
    await new Promise(res => setTimeout(res, 500));
    retries--;
  }

  server = app.listen(0);
  process.env.TEST_JWT = jwt.sign({ userId: "testUserId" }, process.env.JWT_SECRET, {
    expiresIn: "2h"
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  await new Promise(resolve => server.close(resolve));
});

describe("User Routes", () => {
  test("GET /users should return all users", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /users should create a new user", async () => {
    const email = `test_${Date.now()}@example.com`;
    const res = await request(app)
      .post("/users")
      .send({ name: "John Doe", email, password: "securePass123" })
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    console.log("POST /users response:", res.body);
    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty("_id");
    expect(res.body.user.email).toBe(email);
  });

  test("PUT /users/:id should update a user", async () => {
    const createRes = await request(app)
      .post("/users")
      .send({
        name: "Temp User",
        email: `put_${Date.now()}@mail.com`,
        password: "temp123"
      })
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(createRes.status).toBe(201);
    const userId = createRes.body?.user?._id;

    const updated = {
      name: "Updated User",
      email: `updated_${Date.now()}@mail.com`,
      password: "newpass123"
    };

    const res = await request(app)
      .put(`/users/${userId}`)
      .send(updated)
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    console.log("PUT /users response:", res.body);
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe(updated.name);
  });

  test("DELETE /users/:id should delete a user", async () => {
    const createRes = await request(app)
      .post("/users")
      .send({
        name: "Delete Me",
        email: `delete_${Date.now()}@mail.com`,
        password: "deletepass"
      })
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(createRes.status).toBe(201);
    const userId = createRes.body?.user?._id;

    const res = await request(app)
      .delete(`/users/${userId}`)
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    console.log("DELETE /users response:", res.body);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
  });
});
