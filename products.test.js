const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("./server");
const mongoose = require("mongoose");

let server;

beforeAll(async () => {
  process.env.TEST_JWT = jwt.sign(
    { userId: "testUserId" },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  server = app.listen(0); 
});

describe("Product Routes", () => {
  // GET all products
  test("GET /products should return all products", async () => {
    const response = await request(app)
      .get("/products")
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Create a product
  test("POST /products should create a new product", async () => {
    const newProduct = {
      name: "Test Product",
      price: 29.99,
      category: "Electronics"
    };

    const response = await request(app)
      .post("/products")
      .send(newProduct)
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe(newProduct.name);
  });

  // Fail to create product with missing fields
  test("POST /products should fail with missing required fields", async () => {
    const response = await request(app)
      .post("/products")
      .send({ category: "Missing name and price" }) 
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  // Update a product
  test("PUT /products/:id should update a product", async () => {
    const newProductResponse = await request(app)
      .post("/products")
      .send({
        name: "Temp Product",
        price: 19.99,
        category: "Gadgets"
      })
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    const productId = newProductResponse.body?._id;
    if (!productId) {
      throw new Error("Product ID is undefined.");
    }

    const updatedData = {
      name: "Updated Product",
      price: 39.99,
      category: "Electronics"
    };

    const response = await request(app)
      .put(`/products/${productId}`)
      .send(updatedData)
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updatedData.name);
  });

  // Delete a product
  test("DELETE /products/:id should delete a product", async () => {
    const createResponse = await request(app)
      .post("/products")
      .send({
        name: "Temp Product",
        price: 19.99,
        category: "Gadgets"
      })
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    const productId = createResponse.body?._id;
    if (!productId) {
      throw new Error("Product ID is undefined. Cannot delete.");
    }

    const deleteResponse = await request(app)
      .delete(`/products/${productId}`)
      .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe("Product deleted successfully");
  });
});

// Cleanup
afterAll(async () => {
  await server.close();
  await mongoose.connection.close();
  await new Promise(resolve => setTimeout(resolve, 0));
});
