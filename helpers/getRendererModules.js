// A module which will be "required" in every renderer process' .js file.

module.exports = (forMain=false) => {
    var helper =  {
        logger: require("electron-timber"),
        ipc: require("electron-better-ipc"),
        util: require("electron-util"),
        remote: require("electron").remote,
        stores: require("./getStores")(),
        deleteStoreFile: require("./deleteStoreFile"),
        switchPage: require("./switchPage"),
        Window: require("./classes/window")
    }

    if (!forMain) require("./addJqueryToHTML");

    require("./performChecks")(helper);

    return helper;
}