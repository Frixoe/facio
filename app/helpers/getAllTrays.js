module.exports = (h) => {
    if (!h.stores.haspaths.get("hasTraysPath")) return;
    
    let path = h.stores.paths.get("traysPath");
    return h.fs.readdirSync(path);
}