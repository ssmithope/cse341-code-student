const jwt = require("jsonwebtoken");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./server"); // Adjust path if needed

let server;
let productId;

beforeAll(async () => {
    process.env.TEST_JWT = jwt.sign(
        { userId: "testUserId" },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );

    server = app.listen(process.env.NODE_ENV === "test" ? 0 : 10000); // Fix: Use dynamic port for tests
});

describe("Product Routes", () => {
    it("should create a product", async () => {
        const newProduct = {
            name: "Test Product",
            price: 29.99,
            category: "Electronics",
            stock: 10
        };

        const createResponse = await request(app)
            .post("/products")
            .send(newProduct)
            .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

        expect(createResponse.status).toBe(201);
        expect(createResponse.body).toHaveProperty("_id"); // Fix: Ensure _id is returned

        productId = createResponse.body._id;
        if (!productId) throw new Error("Product ID is undefined.");
    });

    it("should update a product", async () => {
        if (!productId) throw new Error("Product ID is undefined.");

        const updatedData = { name: "Updated Product", price: 39.99, category: "Electronics", stock: 20 };

        const updateResponse = await request(app)
            .put(`/products/${productId}`)
            .send(updatedData)
            .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body).toHaveProperty("_id");
        expect(updateResponse.body.name).toBe(updatedData.name);
    });

    it("should fail to create a product with missing required fields", async () => {
        const response = await request(app)
            .post("/products")
            .send({ category: "Missing name and price" }) 
            .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });

    it("should delete a product", async () => {
        if (!productId) throw new Error("Product ID is undefined. Cannot delete.");

        const deleteResponse = await request(app)
            .delete(`/products/${productId}`)
            .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.message).toBe("Product deleted successfully");
    });

    it("should fetch all products", async () => {
        const response = await request(app)
            .get("/products")
            .set("Authorization", `Bearer ${process.env.TEST_JWT}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});

afterAll(async () => {
    await server.close();
    await mongoose.connection.close();
    await new Promise(resolve => setTimeout(resolve, 0)); // Ensures async cleanup
});
