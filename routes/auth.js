const express = require("express");
const passport = require("passport");
const router = express.Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags: ["Auth"]
 *     summary: Initiate Google OAuth login
 *     responses:
 *       302:
 *         description: Redirects to Google login page
 */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags: ["Auth"]
 *     summary: Handle Google OAuth callback
 *     responses:
 *       200:
 *         description: User successfully authenticated
 *       401:
 *         description: Authentication failed
 */
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    res.redirect("/dashboard");  // Redirect to dashboard after successful login
});

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     tags: ["Auth"]
 *     summary: Logs out the authenticated user
 *     responses:
 *       200:
 *         description: User successfully logged out
 */
router.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});

module.exports = router;
