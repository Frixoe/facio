module.exports = () => {
    const Store = require("electron-store");
    let stores = require("./../storesinfo");

    let storesObj = {};

    for (var i = 0; i < stores.length; ++i) {
        storesObj[stores[i].name] = new Store(stores[i]);
    }

    return storesObj;
}