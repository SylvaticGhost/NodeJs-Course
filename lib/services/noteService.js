const { Contracts } = require("../contracts");
const { Note } = require("../../models/note");
const {
    insertNote,
    findNoteById,
    findNotesForUser,
    searchNote, deleteNoteWithInteractions, updateNodeTitle, updateTime: updateNoteUpdTime,
} = require("../repositories/noteRepository");
const { moveFiles, deleteFile, deleteDirectory, createDirectory} = require("../fileManager");
const { Result } = require("../result");
const { basename } = require("node:path");
const { validate: isUuid } = require("uuid");
const Interaction = require("../../models/interaction");
const { insertInteraction } = require("../repositories/interactionRepository");
const NoteSearchOptions = require("../../models/noteSearchOptions"); // Add this import

async function createNote(noteCreateDto) {
    Contracts.NoteCreate.implement(noteCreateDto);

    const note = Note.create(noteCreateDto);

    if (!(await insertNote(note))) return cancelCreationNote();

    if (!(await moveFilesToBucket(note, noteCreateDto))) return cancelCreationNote(noteCreateDto);

    return Result.successCreate(note.dto);
}

async function updateNote(noteUpdateDto) {
    Contracts.NoteUpdate.implement(noteUpdateDto);

    const note = await findNoteById(noteUpdateDto.id);
    if (!note) return Result.notFound("Note not found");

    if (noteUpdateDto.title) {
        await updateNodeTitle(noteUpdateDto.id, noteUpdateDto.title);
    }
    console.log(`cleanup ${note.realBucketLocation}`);
    await deleteDirectory(note.realBucketLocation);
    console.log(`create ${note.realBucketLocation}`);
    createDirectory(note.realBucketLocation);
    console.log('move files');
    await moveFilesToBucket(note, noteUpdateDto);

    await updateNoteUpdTime(noteUpdateDto);
    return Result.success();
}

async function cancelCreationNote(noteCreateDto) {
    const filesToDelete = [noteCreateDto.filePath, ...noteCreateDto.images];

    for (const file of filesToDelete) await deleteFile(file);

    return Result.internalError();
}

async function moveFilesToBucket(note, noteCreateDto) {
    if (!note instanceof Note) throw new TypeError();
    Contracts.NoteFiles.implement(noteCreateDto);

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

        await deleteNoteWithInteractions(id);

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

async function getNote(noteId, issuer = null) {
    if (!isUuid(noteId)) return Result.badRequest("Invalid note ID format");
    const note = await findNoteById(noteId);
    if (note && issuer) {
        const intr = Interaction.forNote(note.id, issuer);
        await insertInteraction(intr);
    }
    return Result.handleGetResult(note);
}

async function searchNotes(params) {
    if (!(params instanceof NoteSearchOptions))
        throw new TypeError("params must be an instance of NoteSearchOptions");
    params.normalize();

    try {
        const notes = await searchNote(params);
        console.info("Search results:", notes);
        notes.notes = notes?.notes ? notes.notes.map((note) => note.dto) : [];
        console.info("Search DTOs:", notes.notes);
        return Result.success(notes);
    } catch (error) {
        console.error("Error searching notes:", error);
        return Result.internalError("Failed to search notes");
    }
}

module.exports = {
    createNote,
    removeNote,
    getNotesForUser,
    getNote,
    searchNotes,
    updateNote,
};
