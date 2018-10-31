module.exports = (h) => {
    let path = h.stores.paths.get("traysPath");
    return h.fs.readdirSync(path);
}