const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const authentication = require('../middleware/authentitaction');
// User model in database
const Contact = require('../modals/Contact');

/**
 * @route GET api/contacts
 * @desc Get all users contacts
 * @access Private
 */
router.get('/', authentication, async (req, res) => {
    try {
        // Find all contacts for user logged in sort DESC
        const contacts = await Contact.find({user: req.user.id}).sort({date: -1})
        res.json(contacts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error!');
    }
})

/**
 * @route POST api/contacts
 * @desc Add a new contact
 * @access Private
 */
router.post('/', [authentication, [
    check('name', 'Name is required!').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    const {name, email, phone, type} = req.body;
    try {
        const newContact = new Contact({
            name,
            email,
            phone,
            type,
            user: req.user.id
        })
        const contact = await newContact.save();
        res.json(contact);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error!');
    }
})

/**
 * @route PUT api/contacts/:id
 * @desc Update contact
 * @access Private
 */
router.put('/:id', authentication, async (req, res) => {
    const {name, email, phone, type} = req.body;
    // Build updated contact object
    const contactFields = {};
    if (name) contactFields.name = name;
    if (email) contactFields.email = email;
    if (phone) contactFields.phone = phone;
    if (type) contactFields.type = type;
    try {
        // Find contact
        let contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({msg: 'Contact not found!'})
        // Make sure user owns contact
        if (contact.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'Not authorized'})
        }
        // Update contact
        contact = await Contact.findByIdAndUpdate(req.params.id,
            {$set: contactFields},
            {new: true});
        res.json(contact);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error!');
    }
})

/**
 * @route DELETE api/contacts/:id
 * @desc Update contact
 * @access Private
 */
router.delete('/:id', authentication, async (req, res) => {

    try {
        // Find contact
        let contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({msg: 'Contact not found!'})
        // Make sure user owns contact
        if (contact.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'Not authorized'})
        }
        // Delete contact
        await Contact.findByIdAndRemove(req.params.id)
        res.json({msg: `Contact ${contact.name} deleted`});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error!');
    }

})

module.exports = router;