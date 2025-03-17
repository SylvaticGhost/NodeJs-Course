const prisma = require("../../prisma/client");
const {Note} = require("../../models/note");

async function insertNote(note) {
    if (!(note instanceof Note)) throw new TypeError('note must be an instance of Note');

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
    const data = await prisma.note.findUnique({
        where: {
            id: id
        }
    });
    if (!data) return null;
    return new Note(data.id, data.owner, data.title, data.createdAt, data.updatedAt);
}

async function getNotesForUser(username) {
    const data = await prisma.note.findMany({
        where: {
            owner: username
        }
    });

    return data.map(note => new Note(note.id, note.owner, note.title, note.createdAt, note.updatedAt));
}

module.exports = {
    insertNote,
    deleteNote,
    findNoteById,
    getNotesForUser
}
