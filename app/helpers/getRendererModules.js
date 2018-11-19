// A module which will be "required" in every renderer process' .js file.
function wantsModule(arr, mod) {
    return arr.indexOf(mod) > -1;
}

function getLogger() {
    return require("electron-is-dev")
        ? require("electron-timber")
        : {
              log: str => {},
              error: str => {}
          };
}

module.exports = (forMain = false, all = true, which = ["logger"]) => {
    let helper = {};

    if (!all) {
        if (wantsModule(which, "logger")) helper.logger = getLogger();
        if (wantsModule(which, "ipc"))
            helper.ipc = require("electron-better-ipc");
        if (wantsModule(which, "util")) helper.util = require("electron-util");
        if (wantsModule(which, "remote"))
            helper.remote = require("electron").remote;
        if (wantsModule(which, "stores"))
            helper.stores = require("./getStores")();
        if (wantsModule(which, "deleteStoreFile"))
            helper.deleteStoreFile = require("./deleteStoreFile");
        if (wantsModule(which, "switchPage"))
            helper.switchPage = require("./switchPage");
        if (wantsModule(which, "Window"))
            helper.Window = require("./classes/window");
        if (wantsModule(which, "fs")) helper.fs = require("fs");
    } else {
        helper = {
            logger: getLogger(),
            ipc: require("electron-better-ipc"),
            util: require("electron-util"),
            remote: require("electron").remote,
            stores: require("./getStores")(),
            deleteStoreFile: require("./deleteStoreFile"),
            switchPage: require("./switchPage"),
            Window: require("./classes/window"),
            fs: require("fs")
        };
    }

    if (!forMain) require("./addJqueryToHTML");

    require("electron-unhandled")({
        showDialog: true,
        logger: helper.logger.error
    });

    return helper;
};
