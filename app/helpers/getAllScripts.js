module.exports = h => {
    if (!h.fs) h.fs = require("fs");

    if (!h.fs.existsSync(h.stores.paths.get("scriptsPath"))) return [];

    const supportedScriptExtensions = require("./../keys")
        .supportedScriptExtensions;
    const path = require("path");

    return h.fs
        .readdirSync(h.stores.paths.get("scriptsPath"))
        .filter((script, ind, arr) => {
            return (
                !h.fs
                    .lstatSync(
                        path.join(h.stores.paths.get("scriptsPath"), script)
                    )
                    .isDirectory() &&
                supportedScriptExtensions.indexOf(path.extname(script)) !== -1
            );
        });
};
