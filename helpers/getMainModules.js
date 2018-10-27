module.exports = (index) => {
    var rMods = require("./getRendererModules")(0);

    delete rMods.remote;

    rMods.fs = require("fs");
    return rMods;
}