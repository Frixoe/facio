module.exports = () => {
    var Store = require("electron-store");
    var stores = require("./../storesinfo");

    var storesObj = {};

    for (var i = 0; i < stores.length; ++i) {
        storesObj[stores[i].name] = new Store(stores[i]);
    }

    return storesObj;
}