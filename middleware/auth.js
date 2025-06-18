const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "Server misconfiguration: JWT_SECRET is missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                const newToken = jwt.sign({ userId: decoded?.userId }, process.env.JWT_SECRET, { expiresIn: "2h" });
                console.log("New JWT Generated:", newToken);
                return res.status(401).json({ message: "Token expired, please refresh your token", newToken });
            }
            return res.status(403).json({ message: "Invalid or malformed token" });
        }

        req.user = decoded;
        next();
    });
}

module.exports = authenticateToken;
