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

let div_width = window.innerWidth;
let div_height = window.innerHeight;

const wc = require("webcamjs");
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
    $("#video").attr({
        style: "width: " + div_width + "px; " + "height: " + div_height + "px;"
    });

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
        e.preventDefault();
        wc.freeze();

        h.logger.log("snapping...");
        
        curImPath = path.join(os.tmpdir(), "facio", uuidv4() + ".png");
        h.logger.log("snap path: " + curImPath);

        wc.snap(data_uri => im.outputFile(data_uri, curImPath));

        h.stores.state.set("onePicPath", curImPath);
        
        // Add this temp image path to the tempimgs store.
        let arr = h.stores.tempimgs.get("imgs");
        arr.push(curImPath);

        h.stores.tempimgs.set("imgs", arr);

        if (!dataWinIsOpen) {
            (async () => await h.ipc.callMain("get-pages", ""))()
            
            .then(pages => {
                // Open the data window...
                dataWin = new h.Window(h.logger, pages, h.remote.BrowserWindow, {
                    width: 1000,
                    height: 600,
                    resizable: false,
                    fullscreenable: false,
                    show: false,
                    maximizable: false
                }, "eid.html", () => {
                    dataWin = null;
                    dataWinIsOpen = false;
                });
    
                dataWin.win.on("ready-to-show", () => {
                    dataWin.win.show();
                    dataWin.win.focus();
                });
    
                dataWinIsOpen = true;
            });
        }
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