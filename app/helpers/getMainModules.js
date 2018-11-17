module.exports = (which = null) => {
  let wantAll = true;

  if (which) wantAll = false;

  let rMods = require("./getRendererModules")((forMain = true), false, which);
  require("./performPathChecks")(rMods);

  delete rMods.remote;

  rMods.fs = require("fs");
  return rMods;
};
