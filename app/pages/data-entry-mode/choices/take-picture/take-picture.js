const os = require("os");
const path = require("path");
const chokidar = require("chokidar");
const im = require("image-data-uri");
const uuidv4 = require("uuid/v4");
const wc = require("webcamjs");

const h = require("./../../../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "switchPage",
    "ipc",
    "Window",
    "util",
    "remote",
    "fs"
]);

let div_width = window.innerWidth;
let div_height = window.innerHeight;
let webcamWin = h.remote.getCurrentWindow();

wc.set({
    width: div_width,
    height: div_height,
    image_format: "png",
    flip_horiz: true
});

h.logger.log("window dims: " + window.innerWidth + " " + window.innerHeight);

h.logger.log("loaded 'take-picture.html'");

wc.on("load", () => {
    h.logger.log("webcamjs loaded...");
});

let curImPath = ""; // The path of the current image.
let dataWinIsOpen = false;
let dataWin = null;

$(() => {
    let msgstoreWatcher = chokidar.watch(h.stores.msgstore.path);

    msgstoreWatcher
        .on("ready", () => h.logger.log("take-pic.js: msgstore watcher reporting for duty!"))
        .on("all", (event, path) => {
            let msg = h.stores.msgstore.get("msg");

            if (msg === "") return;

            if (msg === "trays-dir-deleted") {
                h.logger.log("the trays dir was deleted, switching page to index.html");

                h.switchPage(fadeOutLeft, "index.html");
            } else if (msg === "trays-dir-empty") {
                h.logger.log("the trays dir was emptied, switching to tcae.html");

                h.switchPage(fadeOutLeft, "tcae.html");
            } else if (msg === "tray-deleted") {
                h.logger.log("a tray was deleted...");

                if (!h.fs.existsSync(h.stores.state.get("currentTray"))) {
                    h.logger.log("take-pic.js: the current tray was deleted...");
                    h.logger.log("switching to tcae.html");
                    h.switchPage(fadeOutLeft, "tcae.html");
                }
            }

            h.stores.msgstore.set("msg", "");
        });


    $(".container")
        .show()
        .addClass("fadeInLeft animated");

    $("#video").attr({
        style: "width: " + div_width + "px; " + "height: " + div_height + "px;"
    });

    wc.on("error", err => {
        $("#recheck-webcam-btn").prop("disabled", false);

        h.logger.log("err: " + err);

        let p = document.createElement("p");
        p.innerHTML = err;

        $("#info-text")
            .html("")
            .append(p);
    });

    wc.on("live", () => {
        $("#recheck-webcam-btn").prop("disabled", true);

        fadeOutDown();
        toggleWebcam();
        h.logger.log("found webcam, starting streaming...");
    });

    wc.attach("#video");

    $(".back-btns").click(e => {
        e.preventDefault();
        h.switchPage(fadeOutLeft, "choices.html");

        if (dataWin) dataWin.win.close();
    });

    $("#snap-btn").click(e => {
        e.preventDefault();

        h.logger.log("snapping...");

        curImPath = path.join(os.tmpdir(), "facio", uuidv4() + ".png");
        h.logger.log("snap path: " + curImPath);

        h.stores.state.set("onePicPath", curImPath);

        // Snap and Add this temp image path to the tempimgs store.

        wc.snap(data_uri => im.outputFile(data_uri, curImPath));
        let arr = h.stores.tempimgs.get("imgs");
        arr.push(curImPath);

        h.stores.tempimgs.set("imgs", arr);

        h.logger.log("the paths: " + arr);

        if (!dataWinIsOpen) {
            (async () => await h.ipc.callMain("get-pages", ""))().then(
                pages => {
                    // Open the data window...
                    let thisWin = h.util.activeWindow();
                    let thisWinPos = thisWin.getPosition();
                    let thisWinSize = thisWin.getSize();

                    h.logger.log("this window size: " + thisWinSize);

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

    $("#recheck-webcam-btn").click(() => {
        $("#info-text")
            .html("")
            .html("Loading...");

        wc.reset();
        wc.attach("#video");
    });
});

function fadeOutLeft() {
    $(".container")
        .removeClass(["animated", "fadeInLeft"])
        .addClass("fadeOutLeft animated");
}

function fadeOutDown() {
    if ($(".container").hasClass("fadeInLeft"))
        $(".container")
            .removeClass(["animated", "fadeInLeft"])
            .addClass("fadeOutDown animated")
            .hide();
    else
        $(".container")
            .removeClass(["animated", "fadeInUp"])
            .addClass("fadeOutDown animated")
            .hide();
}

function toggleWebcam() {
    if ($(".webcam").hasClass("fadeInDown"))
        $(".webcam")
            .removeClass(["fadeInDown", "animated"])
            .addClass("fadeOutUp animated")
            .toggle();
    else
        $(".webcam")
            .removeClass(["animated", "fadeOutUp"])
            .addClass("fadeInDown animated")
            .toggle();
}
