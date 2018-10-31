module.exports = (anim, pageFileName, cb=null) => {
    let pagePath = require("./../pages.json")[pageFileName];
    let h = require("./getRendererModules")(false, false, ["logger", "remote", "stores"])

    let thisWin = h.remote.getCurrentWindow();
    
    anim();
    thisWin.loadURL(pagePath);

    let prev = h.stores.state.get("currentPage");
    h.stores.state.set("prevPage", prev);
    h.stores.state.set("currentPage", pageFileName);

    h.logger.log(`switched page to '${pageFileName}' from '${prev}'`);
    if (cb !== null) cb();
}