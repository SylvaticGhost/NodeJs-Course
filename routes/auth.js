const express = require('express');
const {authenticateToken} = require("../lib/authService");
const {registerUser, loginUser} = require("../lib/userService");

const router = express.Router();
router.post('/register', async (req, res) => {
    const result = await registerUser(req.body)
    res.status(result.code).json(result)
});

router.post('/login', async (req, res) => {
    const result = await loginUser(req.body)
    res.status(result.code).json(result)
});

router.get('/who-am-i', authenticateToken, (req, res) => {
    res.json({ username: req.user.username });
});

module.exports = router;
