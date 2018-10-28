module.exports = (h, pathKey, val, boolKey) => {
    if (isDir(val)) h.stores.paths.set(boolKey, true);
    else h.stores.paths.set(boolKey, false);

    h.logger.log("checked for path correction for: " + pathKey);
}

function isDir(path) {
    const fs = require("fs");

    try { return fs.lstatSync(path).isDirectory(); }
    catch (err) { return false; }
}