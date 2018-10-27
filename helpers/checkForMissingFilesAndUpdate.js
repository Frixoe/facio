module.exports = (h) => {
    h.stores.state.set("firstLaunch", h.util.isFirstAppLaunch());
    
    let scriptsP = h.stores.paths.get("scriptsPath");
    let traysP = h.stores.paths.get("traysPath");

    checkIfHasPath(h, scriptsP, "hasScriptsPath");
    checkIfHasPath(h, traysP, "hasTraysPath");

    // Update if the path exists.
    h.stores.paths.onDidChange("scriptsPath", (newVal, oldVal) => {
        checkIfHasPath(h, newVal, "hasScriptsPath");
    });

    h.stores.paths.onDidChange("traysPath", (newVal, oldVal) => {
        checkIfHasPath(h, newVal, "hasTraysPath");
    })
}

function isDir(path) {
    const fs = require("fs");

    try { return fs.lstatSync(path).isDirectory(); }
    catch (err) { return false; }
}

function checkIfHasPath(h, newPath, boolKey) {
    if (isDir(newPath)) h.stores.paths.set(boolKey, true);
    else h.stores.paths.set(boolKey, false);
}