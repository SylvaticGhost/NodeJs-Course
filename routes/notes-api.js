const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {authenticateToken} = require("../lib/authService");
const {validateNote} = require("../lib/schemas");
const {validationResult} = require("express-validator");
const upload = require('../lib/storage').upload;
const debug = require('debug')('app:notes-api');

router.post('/',
    authenticateToken,
    validateNote,
    upload.fields([
    {name: 'note', maxCount: 1},
    {name: 'images', maxCount: 10}
]), function (req, res, next) {
    console.log('creating the notes');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const body = req.body;
    const noteFile = req.files['note'] ? req.files['note'][0] : null;
    if(!noteFile) {
        return res.status(400).json({error: 'Note file is required'});
    }
    try {
        console.log('reading file');
        const fileContent = fs.readFileSync(noteFile.path, 'utf-8');
        console.log('content', fileContent);
        res.json({message: 'File uploaded successfully!'});
    }
    catch (err) {
        console.log(err)
        return res.status(400).json({error: 'Invalid note file.'});
    }

});

module.exports = router;
