module.exports = () => {
  const Store = require("electron-store");
  let stores = require("./../storesinfo");
  let eKey = require("../keys").eKey;

  let storesObj = {};

  for (var i = 0; i < stores.length; ++i) {
    stores[i].encryptionKey = eKey;
    storesObj[stores[i].name] = new Store(stores[i]);
  }

  return storesObj;
};
