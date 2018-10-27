module.exports = (h) => {
    h.logger.log("populating 'state' now...");

    h.stores.state.set()

    h.stores.state.set("currentPage", "index.html");
    h.stores.state.set("prevPage", "");
    h.stores.state.set("currentTray", "");
    h.stores.state.set("onePicPath", "");
    h.stores.state.set("picFolderPath", "")
    h.stores.state.set("prevImageInfo", "");

    h.logger.log("populated 'state'");
}