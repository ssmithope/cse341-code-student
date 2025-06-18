const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("./server");

let server;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
  process.env.TEST_JWT = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: "2h" });
  server = app.listen(0);
});

afterAll(async () => {
  await mongoose.connection.close();
  await new Promise((resolve) => server.close(resolve));
});

describe("Products API", () => {
  test("POST /products should create a new product", async () => {
    const newProduct = { name: "Test Product", price: 49.99, category: "Electronics", stock: 10 };

    const response = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`)
      .send(newProduct);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe(newProduct.name);
  });
});
