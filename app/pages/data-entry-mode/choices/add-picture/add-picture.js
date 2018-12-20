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

let dataWin = null;
let tempSingleImgPath = path.join(os.tmpdir(), "facioSingleImgs");
let tempSingleImg = path.join(tempSingleImgPath, "facioImg");

let allowedImgExts = [];

keys.supportedImgExtensions.forEach((val, ind, arr) =>
    allowedImgExts.push("." + val)
);

h.logger.log("loaded 'add-picture.html'");

function pickAPicture() {
    (async () => await h.ipc.callMain("open-imgs-dialog", ""))().then(img => {
        h.logger.log("img foumd: ");
        h.logger.log(img);
        
        if (!img) {
            h.switchPage(fadeOutLeft, "choices.html");
            return;
        }

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

        (async () => await h.ipc.callMain("get-pages", ""))().then(pages => {
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
        });
    });
}

$(() => {
    pickAPicture();

    allowedImgExts.forEach(val => $("#supported-exts").append(val + " "));

    $(".container")
        .show()
        .addClass("fadeInLeft animated");
});

function fadeOutLeft() {
    $(".container")
        .removeClass(["animated", "fadeInLeft"])
        .addClass("fadeOutLeft animated");
}
