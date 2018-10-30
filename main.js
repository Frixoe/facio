const electron = require("electron");
const chokidar = require("chokidar");
const h = require("./helpers/getMainModules")();

require("electron-debug")();

var { app, BrowserWindow } = electron; // Getting required components from the electron module.

var win; // Creating a window variable.
var err;

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
        fullscreenable: false
    }, "index.html", () => {
        delete win;
        app.quit();
    });

    h.logger.log("loaded 'index.html'");
}

h.ipc.answerRenderer("open-dialog", async (val) => {
    const dialog = electron.dialog;
    const dir = dialog.showOpenDialog(win.win, {
        properties: ["openDirectory"]
    });
    return dir;
});

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

var stores = [];
Object.keys(h.stores).forEach(key => {
    if (key === "haspaths") return;
    stores.push(h.stores[key].path);
});

var everyStoreWatcher = chokidar.watch(stores);

everyStoreWatcher.on("unlink", (path, stats) => {
    // Do something if any store file gets deleted.
    h.logger.log("store: " + path + "was deleted.");
    err = new h.Window(h.logger, BrowserWindow, {
        width: 600,
        height: 280,
        center: true,
        parent: h.util.activeWindow(),
        modal: true,
        resizable: false,
        fullscreenable: false
    }, "fme.html", () => {
        delete err;
        delete win;
        app.quit();
    });
}).on("change", (path, stats) => {
    h.logger.log("store: " + path + "was changed");
    
    if (path === h.stores.paths.path) {
        h.logger.log("the scripts/trays path(s) were/was changed, performing checks now...");
        require("./helpers/performPathChecks")(h);
        
        h.logger.log("editting pathchange store");
        h.stores.pathchangestore.set("garbage", ""); // Sending a msg to all watchers of this file.
    }

});