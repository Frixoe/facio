module.exports = (h) => {
    let checkIfHasPath = require("./checkIfHasPath");
    
    h.stores.state.set("isFirstLaunch", h.util.isFirstAppLaunch());

    // Checking if the path is real or not.
    h.stores.paths.onDidChange("scriptsPath", (newVal, oldVal) => checkIfHasPath(h, newVal, "hasScriptsPath"));
    h.stores.paths.onDidChange("traysPath", (newVal, oldVal) => checkIfHasPath(h, newVal, "hasTraysPath"));
}