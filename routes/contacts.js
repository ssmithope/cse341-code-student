const express = require("express");
const router = express.Router();
const Contact = require("../models/contacts");

// Get all contacts
/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Get all contacts
 *     responses:
 *       200:
 *         description: A list of contacts
 */
router.get("/", async (req, res) => {
    const contacts = await Contact.find();
    res.json(contacts);
});

/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Create a new contact
 *     responses:
 *       201:
 *         description: Contact created successfully
 */
router.post("/", async (req, res) => {
    const contact = new Contact({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
    });

    try {
        const newContact = await contact.save();
        res.status(201).json(newContact);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Update a contact
router.put("/:id", async (req, res) => {
    try {
        const updatedContact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedContact);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a contact
router.delete("/:id", async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: "Contact deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;


/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Get all contacts
 *     responses:
 *       200:
 *         description: A list of contacts
 */
router.get("/", async (req, res) => {
    const contacts = await Contact.find();
    res.json(contacts);
});
