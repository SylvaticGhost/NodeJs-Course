const express = require("express");
const router = express.Router();
const { getNote } = require("../lib/services/noteService");

router.get("/:noteId", async function (req, res, next) {
    const noteId = req.params.noteId;
    console.log(`noteId=${noteId}`);
    const result = await getNote(noteId);
    console.info(result);
    return res.render("note", { note: result.value });
});

module.exports = router;
