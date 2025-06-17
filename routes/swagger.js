const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const express = require("express");
const router = express.Router();

const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "My API",
            version: "1.0.0",
            description: "API documentation",
        },
        servers: [{ url: "https://cse341-code-student-88ay.onrender.com" }],
    },
    apis: ["./routes/users.js", "./routes/contacts.js", "./routes/orders.js", "./routes/products.js"], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = router;
