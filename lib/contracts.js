class Contract {
    #schema;

    constructor(schema) {
        this.#schema = schema;
    }

    implement(data) {
        for (const key in this.#schema) {
            if (!key.required && !data[key])
                continue;
            if (this.#schema[key].required && !data[key]) {
                throw new Error(`${key} is required`);
            }
            if (typeof data[key] !== this.#schema[key].type) {
                throw new Error(`${key} should be of type ${this.#schema[key].type}`);
            }
        }
    }

    implementArray(array) {
        for(const data of array) {
            this.implement(data);
        }
    }
}

class Contracts {
    static NoteCreate = new Contract({
        username: { type: "string", required: true },
        title: { type: "string", required: true },
        filePath: { type: "string", required: true },
        images: { type: "object", required: true }, // Arrays are "object" in JS
    });

    static NoteUpdate = new Contract({
        id : { type: "string", required: true },
        username: { type: "string", required: true },
        title: { type: "string", required: false },
        filePath: { type: "string", required: true },
        images: { type: "object", required: false }, // Arrays are "object" in JS
    });

    static NoteFiles = new Contract({
        filePath: { type: "string", required: true },
        images: { type: "object", required: false },
    });

    static UserCreate = new Contract({
        username: { type: "string", required: true },
        password: { type: "string", required: true },
    });

    static UserLogin = new Contract({
        username: { type: "string", required: true },
        password: { type: "string", required: true },
    });

    static MoveFile = new Contract({
        sourcePath: { type: "string", required: true },
        targetDirectory: { type: "string", required: true },
    });
}

module.exports = {
    Contracts
};
