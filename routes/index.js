const express = require('express');
const router = express.Router();
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.user) {
    res.sendFile(path.join(__dirname, '../views/index.html'));
  } else {
    res.sendFile(path.join(__dirname, '../views/auth.html'));
  }
});

module.exports = router;
