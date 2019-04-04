const path = require("path");
const os = require("os");
const wc = require("webcamjs");
const im = require("image-data-uri");
const uuidv4 = require("uuid/v4");
const getAllFacesImageDescriptor = require("./../../../helpers/getAllFacesImageDescriptor");
const getSingleFaceImageDescriptor = require("./../../../helpers/getSingleFaceImageDescriptor");
const sampleImageUri = require("./sample-data-uri");
const h = require("./../../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "switchPage",
    "fs"
]);

let divWidth = window.innerWidth;
let divHeight = window.innerHeight;
let modelsDir = "./../../../assets/models";
let infTmpFolder = "facioInference"; // Inference temp folder
let infTmpFolderPath = path.join(os.tmpdir(), infTmpFolder);
let infImgName = "lastSteamingImage.png";
let infImgPath = path.join(infTmpFolderPath, "lastStreamingImage.png");

h.logger.log("window dims: " + window.innerWidth + " " + window.innerHeight);

// Monkey patching face-api.js
faceapi.env.monkeyPatch({
    Canvas: HTMLCanvasElement,
    Image: HTMLImageElement,
    ImageData: ImageData,
    Video: HTMLVideoElement,
    createCanvasElement: () => document.createElement("canvas"),
    createImageElement: () => document.createElement("img")
});

wc.set({
    width: divWidth,
    height: divHeight,
    image_format: "png",
    flip_horiz: true
});

wc.on("load", () => {
    h.logger.log("webcamjs loaded...");
});

$(() => {
    $(".back-btns").click((e) => {
        e.preventDefault();
        h.switchPage(fadeOutRight, "field.html", true)
    });

    $("#video").attr({
        style: "width: " + divWidth + "px; " + "height: " + divHeight + "px;"
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
        $("#tray-name").html(h.stores.state.get("currentTray"));

        // TODO: Get a sample image data uri saying something and generate that at load.
        im.outputFile(sampleImageUri, infImgPath);
        // Where I left: Saving the image but descriptor isn't being generated.

        $("#test-btn").click(e => {
            wc.snap(data_uri => {
                // Save the image
                // Send the image path to getSingleFace... function
                // Get descriptor

                getAllFacesImageDescriptor(h, faceapi, document, infImgPath, path.join(__dirname, "..", "..", "..", "assets", "models"), im.outputFile, [data_uri, infImgPath])
                    .then(descriptor => {
                        h.logger.log("Descriptor: ");
                        h.logger.log(descriptor);
                    })
                    .catch(err => {
                        h.logger.log("Got error: ");
                        h.logger.log(err);
                    });
            });
        });

        fadeOutDown();
        toggleWebcam();
        h.logger.log("found webcam, starting streaming...");
    });

    wc.attach("#video");

    $("#recheck-webcam-btn").click(() => {
        $("#info-text")
            .html("")
            .html("Loading...");

        wc.reset();
        wc.attach("#video");
    });

    $(".container")
        .show()
        .addClass("fadeInRight animated");
});

function fadeOutLeft() {
    $(".container")
        .removeClass(["animated", "fadeInRight"])
        .addClass("fadeOutLeft animated");
}

function fadeOutRight() {
    $(".container")
        .removeClass(["animated", "fadeInRight"])
        .addClass("fadeOutRight animated");
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

function fadeOutDown() {
    if ($(".container").hasClass("fadeInRight"))
        $(".container")
            .removeClass(["animated", "fadeInRight"])
            .addClass("fadeOutDown animated")
            .hide();
    else
        $(".container")
            .removeClass(["animated", "fadeInUp"])
            .addClass("fadeOutDown animated")
            .hide();
}
