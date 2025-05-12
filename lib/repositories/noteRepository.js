const prisma = require("../../prisma/client");
const { Note } = require("../../models/note");
require("../../models/noteSearchOptions");
async function insertNote(note) {
    if (!(note instanceof Note)) throw new TypeError("note must be an instance of Note");

    return prisma.note.create({
        data: {
            id: note.id,
            owner: note.owner,
            title: note.title,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
        },
    });
}

async function deleteNote(id) {
    return prisma.note.delete({
        where: {
            id: id,
        },
    });
}

async function updateNodeTitle(id, title) {
    return prisma.note.update({
        where: {
            id: id,
        },
        data: {
            title: title,
        },
    });
}

async function updateTime(id, time) {
    return prisma.note.update({
        where: {
            id: id,
        },
        data: {
            updatedAt: time,
        },
    });
}

async function findNoteById(id) {
    const data = await prisma.note.findUnique({
        where: {
            id: id,
        },
    });
    if (!data) return null;
    return new Note(data.id, data.owner, data.title, data.createdAt, data.updatedAt);
}

async function findNotesForUser(username) {
    const data = await prisma.note.findMany({
        where: {
            owner: username,
        },
    });
    return data.map(
        (note) => new Note(note.id, note.owner, note.title, note.createdAt, note.updatedAt)
    );
}

async function searchNote(params) {
    const queryOptions = {
        where: {},
        orderBy: [],
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
    };

    if (params.username) {
        queryOptions.where.owner = params.username;
    }

    if (params.text && params.text.trim() !== "") {
        queryOptions.where.title = {
            contains: params.text,
            mode: "insensitive",
        };
    }

    if (params.filter === "viewed") {
        queryOptions.include = {
            interactions: {
                take: 1,
            },
        };

        queryOptions.orderBy.push({
            interactions: {
                _count: params.order,
            },
        });


    } else {
        const fieldName = params.filter === "created" ? "createdAt" : "updatedAt";
        queryOptions.orderBy.push({ [fieldName]: params.order });
    }

    const notes = await prisma.note.findMany(queryOptions);

    const total = await prisma.note.count({ where: queryOptions.where });

    const mappedNotes = notes.map((note) => {
        return new Note(note.id, note.owner, note.title, note.createdAt, note.updatedAt);
    });

    return {
        notes: mappedNotes,
        pagination: {
            page: params.page,
            pageSize: params.pageSize,
            total,
            pages: Math.ceil(total / params.pageSize),
        },
    };
}

/**
 * Deletes a note and all related interactions in a single transaction.
 * @param {string} id - The note ID.
 * @returns {Promise<void>}
 */
async function deleteNoteWithInteractions(id) {
    await prisma.$transaction([
        prisma.interaction.deleteMany({
            where: { noteId: id },
        }),
        prisma.note.delete({
            where: { id: id },
        }),
    ]);
}

module.exports = {
    insertNote,
    deleteNote,
    findNoteById,
    findNotesForUser,
    searchNote,
    deleteNoteWithInteractions,
    updateNodeTitle,
    updateTime,
};

