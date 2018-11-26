const h = require("./../../../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "switchPage",
    "ipc",
    "remote",
    "util",
    "Window"
]);

let dataWinIsOpen = false;
let dataWin = null;

h.logger.log("loaded 'add-folder.html'");

function pickAFolder() {
    (async () => await h.ipc.callMain("open-directory-dialog", ""))().then(
        dir => {
            dir = dir[0];

            if (!dir) h.switchPage(fadeOutLeft, "choices.html");
            h.logger.log("dir got: " + dir);

            // TODO: If there are no supported images present in the folder, make toast, then when dismissed go back a page

            if (!dataWinIsOpen) {
                (async () => await h.ipc.callMain("get-pages", ""))().then(
                    pages => {
                        // Open the data window...
                        let thisWin = h.util.activeWindow();
                        let thisWinSize = thisWin.getSize();

                        h.logger.log("this window size: " + thisWinSize);

                        h.stores.state.set("tempImagesPath", dir);

                        dataWin = new h.Window(
                            h.logger,
                            pages,
                            h.remote.BrowserWindow,
                            {
                                width: 1000,
                                height: 600,
                                resizable: false,
                                fullscreenable: false,
                                show: false,
                                maximizable: false
                            },
                            "eid.html",
                            () => {
                                dataWin = null;
                                dataWinIsOpen = false;

                                h.switchPage(fadeOutLeft, "choices.html");
                            }
                        );

                        dataWin.win.on("ready-to-show", () => {
                            dataWin.win.show();
                            dataWin.win.focus();
                        });

                        dataWin.win.on("move", () => {
                            h.logger.log("eid.html window was moved...");
                        });

                        dataWinIsOpen = true;
                    }
                );
            }
        }
    );
}

$(() => {
    pickAFolder();

    $(".container")
        .show()
        .addClass("fadeInLeft animated");
});

function fadeOutLeft() {
    $(".container")
        .removeClass(["animated", "fadeInLeft"])
        .addClass("fadeOutLeft animated");
}
