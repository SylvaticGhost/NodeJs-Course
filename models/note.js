const { v4: uuidv4 } = require('uuid');

const Url = 'http://localhost/volume';
const Bucket = 'volumes/note-buckets';

class Note {
    id;
    owner;
    title;
    createdAt;
    updatedAt;

    constructor(id, owner, title, createdAt, modifiedAt) {
        this.id = id;
        this.owner = owner;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = modifiedAt;
    }

    static create(data) {
        const id = uuidv4();
        return new Note(
            id,
            data.username,
            data.title,
            new Date(),
            new Date(),
        );
    }

    get bucketUrl() {
        return `${Url}/${this.id}`;
    }

    get bucket() {
        return `${Bucket}/${this.id}`;
    }

    get realBucketLocation() {
        return `volumes/note-buckets/${this.id}`;
    }

    get noteUrl() {
        return `${Url}/${this.id}/note.md`;
    }

    get dto() {
        return {
            ...this,
            url: this.noteUrl,
        }
    }
}

module.exports = {
    Note,
};
