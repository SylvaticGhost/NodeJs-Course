const express = require("express");
const router = express.Router();
const {authenticateToken} = require("../lib/services/authService");
const {validationResult} = require("express-validator");
const {
    createNote,
    removeNote,
    getNotesForUser,
    searchNotes, updateNote,
} = require("../lib/services/noteService");
const {Result} = require("../lib/result");
const upload = require("../lib/storage").upload;
const NoteSearchOptions = require("../models/noteSearchOptions");
const {validateNote} = require("../lib/schemas");

router.patch("/:id", authenticateToken,
    upload.fields([{name: "note", maxCount: 1}, {name: "images", maxCount: 10}]),
    async function (req, res) {
        const params = getNoteUpsertInfo(req);
        const id = req.params.id;
        if (!id) return Result.badRequest("Note ID is required").asEndpointResponse(res);
        if (!params.filePath) return Result.badRequest("Note file is required").asEndpointResponse(res);
        if (!params.username) return Result.badRequest("Username is required").asEndpointResponse(res);
        const updateNoteDto = {
            id: id,
            ...params
        }

        console.info('updateNoteDto', updateNoteDto);

        const result = await updateNote(updateNoteDto);
        console.info(result)
        return result ? result.asEndpointResponse(res) : Result.internalError("Internal server error");
    });

function getNoteUpsertInfo(req) {
    return {
        title: req.body?.title ?? null,
        id: req.params.id,
        username: req.user.username,
        filePath: req.files["note"][0]?.path ?? null,
        images: (req.files["images"] ?? []).map((image) => image.path),
    }
}

router.post(
    "/",
    ...validateNote,
    authenticateToken,
    upload.fields([
        {name: "note", maxCount: 1},
        {name: "images", maxCount: 10},
    ]),
    async function (req, res) {
        console.log("creating the notes");

        const errors = validationResult(req);
        if (!errors.isEmpty())
            return Result.badRequest(errors.array().join(", ")).asEndpointResponse(res);

        const title = req.body.title;
        if (!title) return Result.badRequest("Title is required").asEndpointResponse(res);

        const noteFile = req.files["note"][0] ?? null;
        if (!noteFile) return Result.badRequest("Note file is required").asEndpointResponse();

        const createNoteDto = {
            username: req.user.username,
            title: title,
            filePath: noteFile.path,
            images: (req.files["images"] ?? []).map((image) => image.path),
        };

        console.info(createNoteDto);

        try {
            const result = await createNote(createNoteDto);

            return result.asEndpointResponse(res);
        } catch (err) {
            console.log(err);
            return res.status(400).json({error: "Invalid note file."});
        }
    }
);

router.delete("/:id", authenticateToken, async function (req, res) {
    const noteId = req.params.id;
    const username = req.user.username;

    if (!noteId) return Result.badRequest("Note ID is required").asEndpointResponse(res);

    const result = await removeNote(noteId, username);
    return result.asEndpointResponse(res);
});

router.get("/user", authenticateToken, async function (req, res) {
    const username = req.user.username;
    const result = await getNotesForUser(username);
    return result.asEndpointResponse(res);
});

router.put("/search", authenticateToken, async function (req, res) {
    try {
        const searchOptions = NoteSearchOptions.fromJson(req.body);

        searchOptions.username = req.user.username;

        // Log the search request for debugging
        console.log("Note search request:", {
            username: req.user.username,
            filter: searchOptions.filter,
            order: searchOptions.order,
            page: searchOptions.page,
            pageSize: searchOptions.pageSize,
            text: searchOptions.text,
        });

        // Perform the search
        const result = await searchNotes(searchOptions);

        // Return the search results
        return result.asEndpointResponse(res);
    } catch (error) {
        console.error("Error during note search:", error);
        return Result.internalError("Failed to search notes").asEndpointResponse(res);
    }
});

router.delete("/:id", authenticateToken, async function (req, res) {
    if (!req.params.id)
        return Result.badRequest("Note ID is required").asEndpointResponse(res);

    const result = await removeNote(req.params.id);
    return result.asEndpointResponse(res);
})

module.exports = router;
