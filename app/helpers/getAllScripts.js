module.exports = h => {
    if (!h.fs) h.fs = require("fs");

    if (!h.fs.existsSync(h.stores.paths.get("scriptsPath"))) return [];

    const supportedExtensions = require("./../keys").supportedExtensions;
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
                supportedExtensions.indexOf(path.extname(script)) !== -1
            );
        });
};
