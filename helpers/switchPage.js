module.exports = (h, anim, pageFileName, cb=null) => {
    let pages = require("./../pages.json");
    let pagePath = pages[pageFileName];

    let thisWin = h.remote.getCurrentWindow();
    
    anim();
    thisWin.loadURL(pagePath);

    let prev = h.stores.state.get("currentPage");
    h.stores.state.set("prevPage", prev);
    h.stores.state.set("currentPage", pageFileName);

    h.logger.log(`switched page to '${pageFileName}' from '${prev}'`);
    if (cb !== null) cb();
}