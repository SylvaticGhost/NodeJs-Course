const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const upload = require('../lib/storage').upload;

router.post('/create', upload.fields([
    {name: 'note', maxCount: 1},
    {name: 'images', maxCount: 10}
]), function (req, res, next) {
    res.json({message: 'File uploaded successfully!'});
});

module.exports = router;
