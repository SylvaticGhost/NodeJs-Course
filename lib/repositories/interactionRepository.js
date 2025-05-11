const prisma = require("../../prisma/client");
const Interaction = require("../../models/interaction");

async function insertInteraction(interaction) {
    if(!(interaction instanceof Interaction)) throw new TypeError('interaction must be an instance of Interaction');

    return prisma.interaction.create({
        data: interaction,
    });
}

module.exports = {
    insertInteraction,
}

