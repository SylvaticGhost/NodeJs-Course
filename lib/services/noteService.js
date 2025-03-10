const {Contracts} = require("../contracts");
const {Note} = require("../../models/note");
const {insertNote} = require("../repositories/noteRepository");
const {moveFiles, deleteFile} = require("../fileManager");
const {Result} = require("../result");
const {basename} = require("node:path");

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

    const renameRule = (sourcePath) => {
        const fileName = basename(sourcePath);
        return fileName.split('-')[1] ?? fileName;
    }

    return moveFiles(params, renameRule);
}

module.exports = {
    createNote,
};
