const fs = require('fs');
const path = require('path');
const {Contracts} = require("./contracts");

async function moveFiles(params, renameRule) {
    Contracts.MoveFile.implementArray(params);

    const completedCopy = [];

    const rollback = async () => {
        for (const {targetPath} of completedCopy)
            await deleteFile(targetPath);
    };

    for (const {sourcePath, targetDirectory} of params) {
        try {
            if (!fs.existsSync(targetDirectory))
                fs.mkdirSync(targetDirectory, { recursive: true });

            const fileName = renameRule ? renameRule(sourcePath) : path.basename(sourcePath);
            const destinationPath = path.join(targetDirectory, fileName);

            await fs.promises.copyFile(sourcePath, destinationPath);
            completedCopy.push({sourcePath, targetPath: destinationPath});
        }
        catch (error) {
            console.error(error);
            await rollback();
            return false;
        }
    }

    for (const {sourcePath} of completedCopy) {
        try {
            await fs.promises.unlink(sourcePath);
        }
        catch (error) {
            console.error("Error deleting source file:", error);
        }
    }

    return true;
}

async function deleteFile(path) {
    if(fs.existsSync(path))
        return fs.promises.unlink(path);
}

module.exports = {
    moveFiles,
    deleteFile,
}
