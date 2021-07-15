const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../modals/Users');

/**
 * @route POST api/users
 * @desc Register a user
 * @access Public
 */
router.post('/', [
    check('name', 'Please enter a name').not().isEmpty(),
    check('email', 'Please include valid email!').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    const {name, email, password} = req.body;

    try {
        // If user with that email exists
        let user = await User.findOne({email});

        if (user) {
            return res.status(400).json({msg: 'User already exists!'})
        }
        // Create a new user
        user = new User({
            name,
            email,
            password
        });
        // Password encrypt
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        // Save user to database
        await user.save();
        // Response
        res.send('User saved!');
    } catch (err) {
        console.error(err.message);
        res.send(500).send('Server error!');
    }
})

module.exports = router;