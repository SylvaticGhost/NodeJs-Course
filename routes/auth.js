const express = require("express");
const { authenticateToken } = require("../lib/services/authService");
const { registerUser, loginUser } = require("../lib/services/userService");

const router = express.Router();

router.post("/register", async (req, res) => {
    const result = await registerUser(req.body);
    res.status(result.code).json(result);
});

router.post("/login", async (req, res) => {
    const result = await loginUser(req.body);

    if(result.code !== 200)
    {
        res.status(result.code).json(result);
        return;
    }

    if (result.value?.token)
    {
        res.cookie("auth_token", result.value.token, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000,
            path: '/',
            sameSite: "lax"
        });
    }
    else
        console.log('No token returned');

    res.status(result.code).json(result);
});

router.get("/who-am-i", authenticateToken, (req, res) => {
    res.json({ username: req.user.username });
});

module.exports = router;
