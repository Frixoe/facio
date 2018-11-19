module.exports = (h, pathKey, val, boolKey) => {
    if (isDir(val)) h.stores.haspaths.set(boolKey, true);
    else h.stores.haspaths.set(boolKey, false);

    h.logger.log(
        "path for " + pathKey + " is " + h.stores.haspaths.get(boolKey)
    );
};

function isDir(path) {
    const fs = require("fs");

    try {
        return fs.lstatSync(path).isDirectory();
    } catch (err) {
        return false;
    }
}
