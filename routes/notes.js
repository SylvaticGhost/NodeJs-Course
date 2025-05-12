const express = require("express");
const router = express.Router();
const { getNote } = require("../lib/services/noteService");
const { authenticateToken } = require("../lib/services/authService");

router.get("/create", authenticateToken, function (req, res, next) {
    return res.render("create-note", {
        username: req.user?.username,
        title: "Create Note",
    });
});

router.get("/:noteId",authenticateToken, async function (req, res, next) {
    const noteId = req.params.noteId;
    console.log(`noteId=${noteId}, username=${req.user?.username}`);
    const result = await getNote(noteId, req.user?.username);
    console.info(result);

    if (!result.value) {
        console.log("Note not found");
        return res.status(404).render("error", {
            message: "Note not found",
            error: { status: 404, stack: "" },
        });
    }

    const isUserOwner = result.value.owner === req.user?.username;
    console.log(`isUserOwner=${isUserOwner}, username=${req.user?.username}, owner=${result.value.owner}`);
    return res.render("note", { note: result.value, isUserOwner: isUserOwner });
});

module.exports = router;
