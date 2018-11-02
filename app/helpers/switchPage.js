module.exports = (anim, pageFileName, goBack=false, cb=null) => {
    const h = require("./getRendererModules")(false, false, ["logger", "remote", "stores"]);
    const pagesLookup = require("./../pagesLookup.json");
    
    let thisWin = h.remote.getCurrentWindow();

    M.Toast.dismissAll();
    
    anim();

    if (goBack) {
        let prevPage = h.stores.state.get("prevPage");
        let currentPage = h.stores.state.get("currentPage");

        thisWin.loadURL(pagesLookup[prevPage]);

        h.stores.state.set("prevPage", currentPage);
        h.stores.state.set("currentPage", prevPage);

        h.logger.log(`went back to '${prevPage}' from '${currentPage}'`);
        return;
    }
    
    let pagePath = pagesLookup[pageFileName];
    thisWin.loadURL(pagePath);

    let prev = h.stores.state.get("currentPage");
    h.stores.state.set("prevPage", prev);
    h.stores.state.set("currentPage", pageFileName);

    h.logger.log(`switched page to '${pageFileName}' from '${prev}'`);
    if (cb !== null) cb();
}