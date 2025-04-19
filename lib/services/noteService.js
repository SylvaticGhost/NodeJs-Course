const { Contracts } = require("../contracts");
const { Note } = require("../../models/note");
const {
    insertNote,
    deleteNote,
    findNoteById,
    findNotesForUser,
} = require("../repositories/noteRepository");
const { moveFiles, deleteFile, deleteDirectory } = require("../fileManager");
const { Result } = require("../result");
const { basename } = require("node:path");
const { validate: isUuid } = require("uuid");

async function createNote(noteCreateDto) {
    Contracts.NoteCreate.implement(noteCreateDto);

    const note = Note.create(noteCreateDto);

    if (!(await insertNote(note))) return cancelCreationNote();

    if (!(await moveFilesToBucket(note, noteCreateDto))) return cancelCreationNote(noteCreateDto);

    return Result.successCreate(note.dto);
}

async function cancelCreationNote(noteCreateDto) {
    const filesToDelete = [noteCreateDto.filePath, ...noteCreateDto.images];

    for (const file of filesToDelete) await deleteFile(file);

    return Result.internalError();
}

async function moveFilesToBucket(note, noteCreateDto) {
    if (!note instanceof Note) throw new TypeError();

    const destination = note.bucket;

    const params = [
        { sourcePath: noteCreateDto.filePath, targetDirectory: destination },
        ...noteCreateDto.images.map((image) => ({
            sourcePath: image,
            targetDirectory: destination,
        })),
    ];

    const renameRule = (sourcePath) => {
        const fileName = basename(sourcePath);
        return fileName.split("-")[1] ?? fileName;
    };

    return moveFiles(params, renameRule);
}

async function removeNote(id, username) {
    try {
        const note = await findNoteById(id);
        if (!note) {
            return Result.notFound("Note not found");
        }

        if (note.owner !== username) {
            return Result.forbidden("You can only delete your own notes");
        }

        await deleteNote(id);

        await deleteDirectory(note.bucket);

        return Result.success("Note deleted successfully");
    } catch (error) {
        console.error("Error deleting note:", error);
        return Result.internalError("Failed to delete note");
    }
}

async function getNotesForUser(username) {
    const notes = await findNotesForUser(username);
    const dtos = notes.map((note) => note.dto);
    return Result.success(dtos);
}

async function getNote(noteId) {
    if (!isUuid(noteId)) return Result.badRequest("Invalid note ID format");
    const note = await findNoteById(noteId);
    return Result.handleGetResult(note);
}

module.exports = {
    createNote,
    removeNote,
    getNotesForUser,
    getNote,
};
