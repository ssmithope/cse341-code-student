const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1]; 

    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "Server misconfiguration: JWT_SECRET is missing" });
    }

jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err && err.name === "TokenExpiredError") {
        process.env.TEST_JWT = jwt.sign({ userId: decoded?.userId }, process.env.JWT_SECRET, { expiresIn: "2h" });
        console.log("New JWT Generated:", process.env.TEST_JWT);
        return res.status(401).json({ message: "Token expired, new token issued", newToken: process.env.TEST_JWT });
    }


    req.user = decoded;
    next();
});

}

module.exports = authenticateToken;

