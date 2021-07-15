const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
// User model in database
const User = require('../modals/Users');

/**
 * @route GET api/auth
 * @desc Get a logged in user
 * @access Private
 */
router.get('/', (req, res) => {
    res.send('Get a logged in user!');
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