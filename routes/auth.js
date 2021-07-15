const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const authentication = require('../middleware/authentitaction');
// User model in database
const User = require('../modals/Users');

/**
 * @route GET api/auth
 * @desc Get a logged in user
 * @access Private
 */
router.get('/', authentication, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password, -date');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Service error!');
    }
})

/**
 * @route POST api/auth
 * @desc Auth user and get a token
 * @access Public
 */
router.post('/', [
    check('email', 'Please include valid email').isEmail(),
    check('password', 'Password is required!').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    const {email, password} = req.body;
    try {
        let user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({msg: 'Invalid credentials!'})
        }
        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({msg: 'Invalid credentials!'})
        }
        // Create payload for jwt
        const payload = {
            user: {
                id: user.id
            }
        }
        // Sign jwt
        jwt.sign(payload,
            config.get('jwtSecret'),
            {
                expiresIn: 360000
            },
            (err, token) => {
                if (err) throw err;
                res.json({token});
            });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;