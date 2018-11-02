const chokidar = require("chokidar");

const electron = require("electron");
const isDev = require("electron-is-dev");

const h = require("./helpers/getMainModules")();

require("electron-debug")();

if (isDev) h.logger.log("running in Dev mode.");
else h.logger.log("running is Prod mode.");

const { app, BrowserWindow } = electron; // Getting required components from the electron module.

let win; // Creating a window variable.
let err = "dis shit lit"; // Err window var.

let myStoresWatcher;
let myTraysWatcher;

function createWindow() {
    h.stores.state.set("currentPage", "index.html");

    // Checking if any files are missing and if it's the app's first launch.
    h.stores.state.set("isFirstLaunch", h.util.isFirstAppLaunch());
    
    // Create the browser window.
    win = new h.Window(h.logger, BrowserWindow, {
        width: 1000,
        height: 600,
        center: true,
        resizable: false,
        fullscreenable: false,
        show: false
    }, "index.html", () => {
        delete win;
        app.quit();
    });
    win.win.on("ready-to-show", () => {
        win.win.show();
        win.win.focus();
    });

    h.logger.log("loaded 'index.html'");
}

// When app gets ready, create a new window.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // Close the app.
    win = null;
    app.quit();
});

// For a mac.
app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

h.ipc.answerRenderer("open-dialog", async (val) => {
    const dialog = electron.dialog;
    let dir = dialog.showOpenDialog(win.win, {
        properties: ["openDirectory"]
    });
    return dir;
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

myStoresWatcher = chokidar.watch(stores);

myStoresWatcher.on("unlink", (path, stats) => {
    // Do something if any store file gets deleted.
    h.logger.log("store: " + path + "was deleted.");
    err = new h.Window(h.logger, BrowserWindow, {
        width: 600,
        height: 280,
        center: true,
        parent: win.win,
        modal: true,
        resizable: false,
        fullscreenable: false,
        show: false
    }, "fme.html", () => {
        delete err;
        delete win;
        app.quit();
    });
    err.win.on("ready-to-show", () => {
        err.win.show();
        err.win.focus();
    });
    
})
.on("change", (path, stats) => {
    h.logger.log("store: " + path + "was changed");
    
    if (path === h.stores.paths.path) {
        h.logger.log("the scripts/trays path(s) were/was changed, performing checks now...");
        require("./helpers/performPathChecks")(h);
        require("./helpers/checkForAtLeastOneTray")(h);
        
        h.logger.log("editing pathchange store");
        h.stores.pathchangestore.set("garbage", ""); // Sending a msg to all watchers of this file.
    }
});