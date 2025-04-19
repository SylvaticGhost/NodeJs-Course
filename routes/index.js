const { verifyToken } = require("../lib/services/authService");
const express = require("express");
const router = express.Router();
const path = require("path");

/* GET home page. */
router.get("/", function (req, res, next) {
    if (verifyToken(req.cookies.token)) {
        res.sendFile(path.join(__dirname, "../public/index.html"));
    } else {
        res.sendFile(path.join(__dirname, "../public/auth.html"));
    }
});

module.exports = router;
