class Interaction {
    username;
    noteId;
    interactedAt;

    constructor(username, noteId, interactedAt) {
        this.username = username;
        this.noteId = noteId;
        this.interactedAt = interactedAt;
    }

    static forNote(noteId, username) {
        if (!noteId || !username) {
            throw new Error("Note ID and username are required");
        }
        return new Interaction(username, noteId, new Date());
    }
}

module.exports = Interaction;
