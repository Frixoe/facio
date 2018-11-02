const fs = require("fs");
const path = require("path");

module.exports = (h) => {
    if (!h.stores.haspaths.get("hasTraysPath")) return;
    
    let traysPath = h.stores.paths.get("traysPath");
    let trayFiles = fs.readdirSync(traysPath);

    let hasTray = false;

    trayFiles.forEach(file => {
        if (isTray(file)) {
            hasTray = true;
            return;
        }
    });

    if (hasTray) h.logger.log("at least one tray EXISTS...");
    else h.logger.log("no tray found");

    h.stores.state.set("hasAtLeastOneTray", hasTray);
}

function isTray(file) {
    return file.indexOf(".ftray") > -1;
}