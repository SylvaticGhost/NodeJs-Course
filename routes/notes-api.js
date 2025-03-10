const express = require('express');
const router = express.Router();
const {authenticateToken} = require("../lib/authService");
const {validationResult} = require("express-validator");
const {createNote} = require("../lib/services/noteService");
const {Result} = require("../lib/result");
const upload = require('../lib/storage').upload;

router.post('/',
    authenticateToken,
    upload.fields([
    {name: 'note', maxCount: 1},
    {name: 'images', maxCount: 10}
]), async function (req, res, next) {
    console.log('creating the notes');

    const errors = validationResult(req);
    if (!errors.isEmpty())
        return Result.badRequest(errors.array().join(', ')).asEndpointResponse(res);

    const title = req.body.title;
    if(!title)
        return Result.badRequest('Title is required').asEndpointResponse(res);

    const noteFile = req.files['note'][0];
    if(!noteFile)
        return Result.badRequest('Note file is required').asEndpointResponse();

    try {
        const createNoteDto = {
            username: req.user.username,
            title: title,
            filePath: noteFile.path,
            images: (req.files['images'] ?? []).map(image => image.path)
        }

        console.info(createNoteDto);

        const result = await createNote(createNoteDto);

        return result.asEndpointResponse(res);
    }
    catch (err) {
        console.log(err)
        return res.status(400).json({error: 'Invalid note file.'});
    }

});

module.exports = router;
