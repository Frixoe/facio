module.exports = (h) => {
    h.stores.state.set("firstLaunch", h.util.isFirstAppLaunch());

    let allStorePops = require("./store-populators/all");

    Object.keys(allStorePops).forEach(key => {
        if (!h.fs.existsSync(h.stores[key].path) || h.stores.state.get("firstLaunch")) allStorePops[key](h);
    });
}