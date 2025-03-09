const fs = require('fs');
const path = require('path');
const {Contracts} = require("./contracts");

async function moveFiles(params, onFailure) {
    Contracts.MoveFile.implementArray(params);

    const completedCopy = [];

    const rollback = async () => {
        for (const {targetPath} of completedCopy) {
            await deleteFile(targetPath);
        }
    };

    for (const {sourcePath, targetDirectory} of params) {
        try {
            if (!fs.existsSync(targetDirectory))
                fs.mkdirSync(targetDirectory, { recursive: true });

            const fileName = path.basename(sourcePath);
            const destinationPath = path.join(targetDirectory, fileName);

            await fs.promises.copyFile(sourcePath, destinationPath);
            completedCopy.push({sourcePath, targetPath: destinationPath});
        }
        catch (error) {
            console.error(error);
            await rollback();
            if(onFailure) await onFailure(error);
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

async function deleteDirectory(directoryPath) {
    try {
        if (fs.existsSync(directoryPath)) {
            const files = await fs.promises.readdir(directoryPath);

            for (const file of files) {
                const fullPath = path.join(directoryPath, file);
                const stats = await fs.promises.stat(fullPath);

                if (stats.isDirectory()) {
                    await deleteDirectory(fullPath);
                } else {
                    await deleteFile(fullPath);
                }
            }

            await fs.promises.rmdir(directoryPath);
        }
    } catch (error) {
        console.error('Error deleting directory:', error);
        throw error;
    }
}

module.exports = {
    moveFiles,
    deleteFile,
    deleteDirectory
}
