module.exports = () => {
    const Store = require("electron-store");
    let stores = require("./../storesinfo");
    let eKey = require("./../keys").eKey;
    let fileExtension = require("./../keys").storesExtension;

    let storesObj = {};

    for (var i = 0; i < stores.length; ++i) {
        stores[i].encryptionKey = eKey;
        stores[i].fileExtension = fileExtension;

        storesObj[stores[i].name] = new Store(stores[i]);
    }

    return storesObj;
};
