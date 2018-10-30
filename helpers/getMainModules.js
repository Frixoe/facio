module.exports = (index) => {
    var rMods = require("./getRendererModules")(forMain=true);
    require("./performPathChecks")(rMods);

    delete rMods.remote;

    rMods.fs = require("fs");
    return rMods;
}