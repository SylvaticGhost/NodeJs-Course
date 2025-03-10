const prisma = require("../../prisma/client");
const {Note} = require("../../models/note");

async function insertNote(note) {
    if(!(note instanceof Note)) throw new TypeError('note must be an instance of Note');

    return prisma.note.create({
        data: {
            id: note.id,
            owner: note.owner,
            title: note.title,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
        }
    });
}

async function deleteNote(id) {
    return prisma.note.delete({
        where: {
            id: id
        }
    });
}

async function findNoteById(id) {
    return prisma.note.findUnique({
        where: {
            id: id
        }
    });
}

module.exports = {
    insertNote,
    deleteNote,
    findNoteById
}
