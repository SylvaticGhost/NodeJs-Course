const {Contracts} = require("../contracts");
const {Note} = require("../../models/note");
const {insertNote, deleteNote, findNoteById} = require("../repositories/noteRepository");
const {moveFiles, deleteFile, deleteDirectory} = require("../fileManager");
const {Result} = require("../result");

async function createNote(noteCreateDto) {
    Contracts.NoteCreate.implement(noteCreateDto);

    const note = Note.create(noteCreateDto);

    if(!await insertNote(note))
        return cancelCreationNote();

    if(!await moveFilesToBucket(note, noteCreateDto))
        return cancelCreationNote(noteCreateDto);

    return Result.successCreate({noteUrl: note.noteUrl})
}

async function cancelCreationNote(noteCreateDto) {
    const filesToDelete = [noteCreateDto.filePath, ...noteCreateDto.images];

    for (const file of filesToDelete)
        await deleteFile(file);

    return Result.internalError();
}

async function moveFilesToBucket(note, noteCreateDto) {
    if(!note instanceof Note) throw new TypeError();

    const destination = note.bucket;

    const params = [
        {sourcePath: noteCreateDto.filePath, targetDirectory: destination},
        ...noteCreateDto.images.map(image => ({sourcePath: image, targetDirectory: destination}))
    ];

    return moveFiles(params);
}

async function removeNote(id, username) {
    try {
        const noteData = await findNoteById(id);
        if (!noteData) {
            return Result.notFound('Note not found');
        }

        if (noteData.owner !== username) {
            return Result.forbidden('You can only delete your own notes');
        }

        const note = new Note(
            noteData.id,
            noteData.owner,
            noteData.title,
            noteData.createdAt,
            noteData.updatedAt
        );

        await deleteNote(id);

        await deleteDirectory(note.bucket);

        return Result.success('Note deleted successfully');
    } catch (error) {
        console.error('Error deleting note:', error);
        return Result.internalError('Failed to delete note');
    }
}

module.exports = {
    createNote,
    removeNote,
};
