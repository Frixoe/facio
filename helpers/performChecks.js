// This module is for renderers to verify that everything's still working fine.

module.exports = (h) => {
    let checkIfHasPath = require("./checkIfHasPath");

    checkIfHasPath(
        h,
        "scriptsPath",
        h.stores.paths.get("scriptsPath"),
        "hasScriptsPath"
    );

    checkIfHasPath(
        h,
        "traysPath",
        h.stores.paths.get("traysPath"),
        "hasTraysPath"
    );

    if (h.stores.paths.get("hasTraysPath")) {
        h.logger.log("checking if at least one tray exists...");
        require("./checkForAtLeastOneTray")(h);
    } else {
        h.stores.state.set("hasAtLeastOneTray", false);
    }
}