const os = require("os");
const path = require("path");
const chokidar = require("chokidar");
const electron = require("electron");
const isDev = require("electron-is-dev");

const dialog = electron.dialog;
const keys = require("./keys");
const performPathChecks = require("./helpers/performPathChecks");
const checkForAtLeastOneTray = require("./helpers/checkForAtLeastOneTray");
const getAllScripts = require("./helpers/getAllScripts");
const h = require("./helpers/getMainModules")([
    "logger",
    "ipc",
    "util",
    "stores",
    "Window",
    "fs"
]);

if (isDev) require("electron-debug")();

try {
    require("electron-reloader")(module, {
        debug: true,
        watchRenderer: true
    });
} catch (err) {}

require("electron-context-menu")({
    prepend: (params, browserWindow) => [
        {
            label: "Rainbow"
        }
    ]
});

const { app, BrowserWindow, globalShortcut } = electron; // Getting required components from the electron module.

const pages = require("./helpers/crawlPages")(app.getAppPath());

if (isDev) {
    h.logger.log("running in Dev mode.");
}

let win; // Creating a window variable.
let err; // Err window var.

let storesWatcher = null; // Watches all the stores.
let traysWatcher = null; // Watches all the trays.
let scriptsWatcher = null; // Watches all the scripts.

async function initScriptsWatcher() {
    scriptsWatcher = chokidar.watch(h.stores.paths.get("scriptsPath"));

    scriptsWatcher
        .on("ready", () => h.logger.log("scripts watcher reporting for duty!"))
        .on("error", err => {
            h.logger.log("scriptsWatcher encountered an error: " + err);
        })
        .on("add", path => {
            h.logger.log("a new script was added...");
            h.stores.msgstore.set("msg", "script-added");
        })
        .on("addDir", path => {
            h.logger.log("a new dir was added in the scripts dir...");
        })
        .on("unlink", path => {
            h.logger.log("a script was deleted...");

            let scripts = getAllScripts(h);
            if (scripts.length >= 1) {
                h.stores.msgstore.set("msg", "script-deleted");
                return;
            }

            h.logger.log("the scripts dir is empty...");
            h.stores.msgstore.set("msg", "scripts-dir-empty");
        })
        .on("unlinkDir", path => {
            h.logger.log("scripts dir was deleted...");

            h.stores.paths.set("scriptsPath", "");
            h.stores.haspaths.set("hasScriptsPath", false);
            h.stores.msgstore.set("msg", "scripts-dir-deleted");

            scriptsWatcher.close();
            scriptsWatcher = null;
        });
}

async function initTraysWatcher() {
    h.logger.log("starting to watch the trays...");

    traysWatcher = chokidar.watch(h.stores.paths.get("traysPath"));

    traysWatcher
        .on("ready", () => h.logger.log("trays watcher reporting for duty!"))
        .on("error", err =>
            h.logger.log(
                "ERROR WATCHING TRAYS: " +
                    err +
                    "..." +
                    " probs deleting a folder inside the trays folder."
            )
        )
        .on("add", path => {
            h.logger.log("a new tray was added...");

            h.stores.msgstore.set("msg", "tray-added");
        })
        .on("addDir", path =>
            h.logger.log("a new directory was added in the trays directory...")
        )
        .on("unlink", path => {
            h.logger.log("a tray was deleted... path: " + path);

            checkForAtLeastOneTray(h);
            if (!h.stores.state.get("hasAtLeastOneTray"))
                h.stores.msgstore.set("msg", "trays-dir-empty");
            else h.stores.msgstore.set("msg", "tray-deleted");
        })
        .on("unlinkDir", path => {
            if (!(h.stores.paths.get("traysPath") === path)) return;

            h.logger.log(
                "killing trays watcher as the trays dir was deleted..."
            );

            h.stores.haspaths.set("hasTraysPath", false);
            h.stores.paths.set("traysPath", "");
            h.stores.state.set("hasAtLeastOneTray", false);

            // Do something else when the trays dir gets deleted...

            // Sending a signal to all watchers watching the "msgstore"
            h.stores.msgstore.set("msg", "trays-dir-deleted");

            traysWatcher.close();
            traysWatcher = null;
        });
}

async function initDirWatchers() {
    if (h.stores.haspaths.get("hasTraysPath")) initTraysWatcher();
    else
        h.logger.log(
            "not starting trays watcher as a trays path doesn't exist yet..."
        );

    if (h.stores.haspaths.get("hasScriptsPath")) initScriptsWatcher();
    else
        h.logger.log(
            "not starting scripts watcher as a scripts path doesn't exist yet..."
        );
}

function closeAllWatchers() {
    if (!(traysWatcher === null)) traysWatcher.close();
    if (!(storesWatcher === null)) storesWatcher.close();
    if (!(scriptsWatcher === null)) scriptsWatcher.close();
}

// Starting the trays watcher if path already exists...
initDirWatchers();

function createWindow() {
    h.stores.state.set("currentPage", "index.html");
    h.stores.msgstore.set("msg", "");

    globalShortcut.register("CommandOrControl+Q", () => {
        closeAllWatchers();

        BrowserWindow.getAllWindows().forEach((win, ind, arr) => win.close());
        win = null;

        app.quit();
    });

    // Checking if any files are missing and if it's the app's first launch.
    h.stores.state.set("isFirstLaunch", h.util.isFirstAppLaunch());

    let iconPath = path.join(__dirname, "assets", "icons");
    let icon = "";

    if (os.platform() === "win32") icon = "icon.ico";
    else if (os.platform() === "linux") icon = "icon.png";
    else icon = "icon.icns";

    iconPath = path.join(iconPath, icon);

    // Create the browser window.
    win = new h.Window(
        h.logger,
        pages,
        BrowserWindow,
        {
            width: 1000,
            height: 600,
            center: true,
            resizable: false,
            fullscreenable: false,
            show: false,
            maximizable: false,
            titleBarStyle: "hidden",
            icon: iconPath
        },
        "index.html",
        () => {
            delete win;

            BrowserWindow.getAllWindows().forEach(win => win.close());

            app.quit();
            closeAllWatchers();
        }
    );
    win.win.on("ready-to-show", () => {
        win.win.show();
        win.win.focus();
    });

    h.logger.log("loaded 'index.html'");
}

// When app gets ready, create a new window.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // Close the app.
    win = null;
    app.quit();
    closeAllWatchers();
});

// For a mac, but probably never gonna execute.
app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});

h.ipc.answerRenderer("open-directory-dialog", async val => {
    let dir = dialog.showOpenDialog(win.win, {
        title: "Pick a directory",
        properties: ["openDirectory"]
    });
    return dir;
});

h.ipc.answerRenderer("open-imgs-dialog", async val => {
    let img = dialog.showOpenDialog(win.win, {
        title: "Pick an image",
        properties: ["openFile"],
        filters: [{ name: "Images", extensions: keys.supportedImgExtensions }]
    });
    return img;
});

h.ipc.answerRenderer("get-pages", async val => {
    return pages;
});

//////////////////////////////////////
//////////////////////////////////////////////////
/////////WATCHER///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////

let stores = [];
Object.keys(h.stores).forEach(key => {
    if (key === "haspaths") return;
    stores.push(h.stores[key].path);
});

storesWatcher = chokidar.watch(stores);

storesWatcher
    .on("unlink", (path, stats) => {
        // Do something if any store file gets deleted.
        h.logger.log("store: " + path + "was deleted.");
        err = new h.Window(
            h.logger,
            pages,
            BrowserWindow,
            {
                width: 600,
                height: 280,
                center: true,
                parent: win.win,
                modal: true,
                resizable: false,
                fullscreenable: false,
                show: false
            },
            "fme.html",
            () => {
                delete err;
                delete win;
                app.quit();
            }
        );
        err.win.on("ready-to-show", () => {
            err.win.show();
            err.win.focus();
        });
    })
    .on("add", path => {
        if (path === h.stores.tempimgs.path) {
            h.logger.log("filtering the temporary image paths");

            let arr = h.stores.tempimgs.get("imgs");
            let newArr = arr.filter(imgPath => h.fs.existsSync(imgPath));

            h.stores.tempimgs.set("imgs", newArr);
        }
    })
    .on("change", path => {
        h.logger.log("store: " + path + " was changed");

        if (path === h.stores.paths.path) {
            h.logger.log(
                "the scripts/trays path(s) were/was changed, performing checks now..."
            );
            performPathChecks(h);
            checkForAtLeastOneTray(h);

            initDirWatchers();

            h.logger.log("editing  msgstore");
            h.stores.msgstore.set("msg", "path(s)-changed"); // Sending a msg to all watchers of this file.
        }
    });
