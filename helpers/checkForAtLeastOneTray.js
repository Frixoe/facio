const fs = require("fs");
const path = require("path");

module.exports = (h) => {
    let traysPath = h.stores.paths.get("traysPath");
    let trayFiles = fs.readdirSync(traysPath);

    var hasTray = false;

    trayFiles.forEach(file => {
        if (isTray(file)) {
            hasTray = true;
            h.logger.log("at least one tray EXISTS...");
            return;
        }
    });

    h.stores.state.set("hasAtLeastOneTray", hasTray);
}

function isTray(file) {
    return file.indexOf(".ftray") > -1;
}