const electron = require("electron");
const helper = require("./helpers/getMainModules")();

require("electron-debug")();

var { app, BrowserWindow } = electron; // Getting required components from the electron module.

var win; // Creating a window variable.

function createWindow() {
    helper.stores.state.set("currentPage", "index.html");

    // Checking if any files are missing and if it's the app's first launch.
    require("./helpers/updateFirstLaunchVarAndAddListeners")(helper);
    
    // Create the browser window.
    win = new helper.Window(helper.logger, BrowserWindow, {
        width: 1000,
        height: 600,
        center: true,
        resizable: false,
        fullscreenable: false
    }, "index.html", () => {
        delete win;
        app.quit();
    });

    helper.logger.log("loaded 'index.html'");
}

helper.ipc.answerRenderer("open-dialog", async (val) => {
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