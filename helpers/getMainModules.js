module.exports = (index) => {
    var rMods = require("./getRendererModules")(forMain=true);

    delete rMods.remote;

    rMods.fs = require("fs");
    return rMods;
}