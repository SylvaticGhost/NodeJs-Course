const prisma = require("../../prisma/client");

async function userExists(username) {
    const user = await getUser(username);
    return !!user;
}

async function getUser(username) {
    return prisma.user.findUnique({
        where: {username},
    });
}

async function createUser(username, passwordHash, passwordSalt) {
    return prisma.user.create({
        data: {
            username,
            passwordHash: passwordHash,
            passwordSalt: passwordSalt,
        },
    });
}

module.exports = {
    userExists,
    getUser,
    createUser,
}
