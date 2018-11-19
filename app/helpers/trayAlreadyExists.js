module.exports = (h, trayName) => {
    let exists = false;
    h.fs.readdirSync(h.stores.paths.get("traysPath")).forEach(tray => {
        if (
            tray.toLowerCase().replace(".ftray", "") === trayName.toLowerCase()
        ) {
            exists = true;
            return;
        }
    });
    return exists;
};
