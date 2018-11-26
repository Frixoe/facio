const os = require("os");
const path = require("path");
const chokidar = require("chokidar");

const keys = require("./../../../../keys");
const h = require("./../../../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "switchPage",
    "ipc",
    "fs",
    "util",
    "remote",
    "Window"
]);

let dataWinIsOpen = false;
let dataWin = null;
let tempSingleImgPath = path.join(os.tmpdir(), "facioSingleImgs");
let tempSingleImg = path.join(tempSingleImgPath, "facioImg");

let allowedImgExts = [];

keys.supportedImgExtensions.forEach((val, ind, arr) =>
    allowedImgExts.push("." + val)
);

h.logger.log("loaded 'add-picture.html'");

function pickAPicture() {
    (async () => await h.ipc.callMain("open-imgs-dialog"))().then(img => {
        if (!img) return;

        if (h.fs.existsSync(tempSingleImgPath))
            h.fs
                .readdirSync(tempSingleImgPath)
                .forEach(presentImg =>
                    h.fs.unlinkSync(path.join(tempSingleImgPath, presentImg))
                );
        else h.fs.mkdirSync(tempSingleImgPath);

        // Get the image extension. Check which one of the supported extensions it is.
        img = img[0]; // Since "img" is an array.
        h.logger.log(img);
        h.logger.log(path.extname(img));
        let extInd = allowedImgExts.indexOf(path.extname(img).toLowerCase());
        h.logger.log("extInd: " + extInd);

        if (allowedImgExts[extInd] === ".jpg") tempSingleImg += ".jpg";
        else if (allowedImgExts[extInd] === ".png") tempSingleImg += ".png";
        else
            throw Error(
                "Something went wrong while choosing an img for data entering."
            );

        h.logger.log("tempSingleImg: " + tempSingleImg);

        h.fs.copyFileSync(img, tempSingleImg);

        if (!dataWinIsOpen) {
            (async () => await h.ipc.callMain("get-pages", ""))().then(
                pages => {
                    $("#pick-a-picture-btn").prop("disabled", true);

                    // Open the data window...
                    let thisWin = h.util.activeWindow();
                    let thisWinSize = thisWin.getSize();

                    h.logger.log("this window size: " + thisWinSize);

                    h.stores.state.set("tempImagesPath", tempSingleImgPath);

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

                            $("#pick-a-picture-btn").prop("disabled", false);
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
    });
}

$(() => {
    let msgstoreWatcher = chokidar.watch(h.stores.msgstore.path);

    msgstoreWatcher
        .on("ready", () => h.logger.log("msgstoreWatcher reporting for duty!"))
        .on("all", (event, path) => {
            let msg = h.stores.msgstore.get("msg");

            if (msg === "") return;

            if (msg === "trays-dir-deleted") {
                h.logger.log(
                    "the trays dir was deleted, switching page to index.html"
                );

                h.switchPage(fadeOutLeft, "index.html");
            } else if (msg === "trays-dir-empty") {
                h.logger.log(
                    "the trays dir was emptied, switching to tcae.html"
                );

                h.switchPage(fadeOutLeft, "tcae.html");
            } else if (msg === "tray-deleted") {
                h.logger.log("a tray was deleted...");

                if (!h.fs.existsSync(h.stores.state.get("currentTray"))) {
                    h.logger.log(
                        "add-picture.js: the current tray was deleted..."
                    );
                    h.logger.log("switching to tcae.html");
                    h.switchPage(fadeOutLeft, "tcae.html");
                }
            }

            h.stores.msgstore.set("msg", "");
        });

    allowedImgExts.forEach(val => $("#supported-exts").append(val + " "));

    $("#back-btn").click(() => {
        h.switchPage(fadeOutLeft, "choices.html");
        if (dataWin) dataWin.win.close();
    });

    $("#pick-a-picture-btn").click(() => pickAPicture());

    $(".container")
        .show()
        .addClass("fadeInLeft animated");
});

function fadeOutLeft() {
    $(".container")
        .removeClass(["animated", "fadeInLeft"])
        .addClass("fadeOutLeft animated");
}
