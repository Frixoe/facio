module.exports = (h) => {
    h.logger.log("populating 'scripts' now...");

    h.stores.scripts.set("dummy", "text");
    
    h.logger.log("populated 'scripts'");
}