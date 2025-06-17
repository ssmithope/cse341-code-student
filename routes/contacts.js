const express = require("express");
const router = express.Router();
const Contact = require("../models/contacts");
const mongoose = require("mongoose");

/**
 * @swagger
 * tags:
 *   - name: "Contacts"
 *     description: "Contact management routes"
 */

/**
 * @swagger
 * /contacts:
 *   get:
 *     tags: ["Contacts"]
 *     summary: Get all contacts
 *     responses:
 *       200:
 *         description: A list of contacts
 *       404:
 *         description: No contacts found
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req, res) => {
    try {
        const contacts = await Contact.find();
        if (!contacts.length) {
            return res.status(404).json({ message: "No contacts found" });
        }
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching contacts", error: error.message });
    }
});

/**
 * @swagger
 * /contacts/{id}:
 *   get:
 *     tags: ["Contacts"]
 *     summary: Get a contact by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact retrieved successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid contact ID format" });
        }

        const contact = await Contact.findById(req.params.id);
        contact
            ? res.json(contact)
            : res.status(404).json({ message: "Contact not found" });
    } catch (error) {
        res.status(500).json({ message: "Error fetching contact", error: error.message });
    }
});

/**
 * @swagger
 * /contacts:
 *   post:
 *     tags: ["Contacts"]
 *     summary: Create a new contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/", async (req, res) => {
    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const contact = new Contact({ name, phone, email });
        await contact.save();
        res.status(201).json(contact);
    } catch (error) {
        res.status(500).json({ message: "Error creating contact", error: error.message });
    }
});

/**
 * @swagger
 * /contacts/{id}:
 *   put:
 *     tags: ["Contacts"]
 *     summary: Update a contact
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid contact ID format" });
        }

        const updatedContact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        updatedContact
            ? res.json(updatedContact)
            : res.status(404).json({ message: "Contact not found" });
    } catch (error) {
        res.status(500).json({ message: "Error updating contact", error: error.message });
    }
});

/**
 * @swagger
 * /contacts/{id}:
 *   delete:
 *     tags: ["Contacts"]
 *     summary: Delete a contact
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid contact ID format" });
        }

        const deletedContact = await Contact.findByIdAndDelete(req.params.id);
        deletedContact
            ? res.json({ message: "Contact deleted successfully" })
            : res.status(404).json({ message: "Contact not found" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting contact", error: error.message });
    }
});

module.exports = router;
