const h = require("./../../../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "switchPage",
    "ipc",
    "Window",
    "util",
    "remote"
]);

const os = require("os");
const path = require("path");
const im = require("image-data-uri");
const uuidv4 = require("uuid/v4");

const wc = require("webcamjs");
wc.set({
    width: window.innerWidth,
    height: window.innerHeight,
    fps: 60,
    image_format: "png",
    flip_horiz: true
});

h.logger.log("loaded 'take-picture.html'");

wc.on("load", () => {
    h.logger.log("webcamjs loaded...");
});

let curImPath = ""; // The path of the current image.
let dataWin = null;

$(() => {
    wc.on("error", (err) => {
        $("#recheck-webcam-btn").prop("disabled", false);

        h.logger.log("err: " + err);

        let p = document.createElement("p");

        p.innerHTML = err;

        $("#info-text").html("").append(p);
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
        wc.freeze();

        e.preventDefault();
        
        if ($("#snap-btn").hasClass("fadeInUp")) $("#snap-btn").removeClass(["animated", "fadeInUp"]).addClass("fadeOutDown animated").hide();
        else $("#snap-btn").addClass("fadeOutDown animated").hide();

        h.logger.log("snapping...");
        
        curImPath = path.join(os.tmpdir(), "facio", uuidv4() + ".png");
        h.logger.log("snap path: " + curImPath);

        wc.snap(data_uri => im.outputFile(data_uri, curImPath));

        h.stores.state.set("onePicPath", curImPath);

        let pages;
        (async () => {
            pages = await h.ipc.callMain("get-pages", "");
        })()
        .then(() => {

            // Create a new window to enter data regarding that image.
            dataWin = new h.Window(h.logger, pages, h.remote.BrowserWindow, {
                width: 600,
                height: 400,
                parent: h.util.activeWindow(),
                resizable: false,
                fullscreenable: false,
                show: false,
                maximizable: false
            }, "eid.html", () => {
                dataWin = null;
                
                $("#snap-btn").show().removeClass(["animated", "fadeOutDown"]).addClass("fadeInUp animated");
            });

            dataWin.win.on("ready-to-show", () => {
                dataWin.win.show();
                dataWin.win.focus();
            });
        });
    });

    $("#recheck-webcam-btn").click(() => {
        $("#info-text").html("").html("Loading...");

        wc.reset();
        wc.attach("#video");
    });

    $(".container").show().addClass("fadeInLeft animated");
});

function fadeOutLeft() {
    $(".container").removeClass(["animated", "fadeInLeft"]).addClass("fadeOutLeft animated");
}

function fadeOutDown() {
    if ($(".container").hasClass("fadeInLeft")) $(".container").removeClass(["animated", "fadeInLeft"]).addClass("fadeOutDown animated").hide();
    else $(".container").removeClass(["animated", "fadeInUp"]).addClass("fadeOutDown animated").hide();
}

function toggleWebcam() {
    if ($(".webcam").hasClass("fadeInDown")) $(".webcam").removeClass(["fadeInDown", "animated"]).addClass("fadeOutUp animated").toggle();
    else $(".webcam").removeClass(["animated", "fadeOutUp"]).addClass("fadeInDown animated").toggle();
}