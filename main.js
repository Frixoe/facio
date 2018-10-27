const electron = require("electron");
const helper = require("./helpers/getMainModules")();
// require("electron-debug")();

var { app, BrowserWindow } = electron; // Getting required components from the electron module.

let win; // Creating a window variable.

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1000,
        height: 600,
        center: true,
        resizable: false,
        fullscreenable: false
    });
    
    // Checking if any files are missing and if it's the app's first launch.
    require("./helpers/checkForMissingFilesAndUpdate")(helper);

    helper.logger.log("created window");
    
    // and load the index.html of the app.
    win.loadURL(require("./pages.json")["index.html"]);
    helper.stores.state.set("currentPage", "index.html");

    win.setMenu(null);

    helper.logger.log("loaded 'index.html'");
    
    win.on("closed", () => {
        win = null;
        app.quit();
    });
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
