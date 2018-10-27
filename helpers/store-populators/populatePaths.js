// This module will create and populate the apps config file.

module.exports = (helper) => {
    helper.logger.log("populating 'config' now...");

    helper.stores.paths.set("scriptsPath", "");
    helper.store.paths.set("traysPath", "");

    helper.logger.log("populated 'config'");
}