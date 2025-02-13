const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;