module.exports = () => {
    let rMods = require("./getRendererModules")(forMain=true);
    require("./performPathChecks")(rMods);

    delete rMods.remote;

    rMods.fs = require("fs");
    return rMods;
}