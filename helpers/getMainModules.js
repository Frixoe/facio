module.exports = (index) => {
    var rMods = require("./getRendererModules")();

    delete rMods.remote;

    rMods.fs = require("fs");
    return rMods;
}