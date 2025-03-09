const noteCreateContract = {
    username: {
        type: 'string',
        required: true,
    },
    title: {
        type: 'string',
        required: true,
    },
    filePath: {
        type: 'string',
        required: true,
    },
    images: {
        type: 'array',
        required: true,
    },
}

const userCreateContract = {
    username: {
        type: 'string',
        required: true,
    },
    password: {
        type: 'string',
        required: true,
    },
}

const userLoginContract = {
    username: {
        type: 'string',
        required: true,
    },
    password: {
        type: 'string',
        required: true,
    },
}

function implementContract(contract, data) {
    for (const key in contract) {
        if (contract[key].required && !data[key]) {
            throw new Error(`${key} is required`);
        }
        if (typeof data[key] !== contract[key].type) {
            throw new Error(`${key} should be of type ${contract[key].type}`);
        }
    }
}

module.exports = {
    noteCreateContract,
    userCreateContract,
    userLoginContract,
    implementContract,
};
