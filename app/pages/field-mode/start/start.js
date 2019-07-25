const path = require("path");
const os = require("os");
const wc = require("webcamjs");
const Store = require("electron-store");
const im = require("image-data-uri");
const uuidv4 = require("uuid/v4");

const keys = require("./../../../keys");
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
let modelsDir = path.resolve(__dirname, "..", "..", "..", "assets", "models");
let infTmpFolder = "facioInference"; // Inference temp folder
let infTmpFolderPath = path.join(os.tmpdir(), infTmpFolder);
let infImgName = "lastSteamingImage.png";
let infImgPath = path.join(infTmpFolderPath, "lastStreamingImage.png");
let descriptorCounter = 0;
let curTray = new Store({
    name: h.stores.state.get("currentTray"),
    cwd: h.stores.paths.get("traysPath"),
    fileExtension: keys.traysExtension
});
let imagesData = curTray.get("imagesData");
let imageTitles = Object.keys(imagesData);
let faceMatcher = null;
let gDescriptors = null;

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
    initFaceMatcher();

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

        wc.snap(data_uri => {
            // Save the image
            // Send the image path to getAllFaces... function
            // Get descriptor
            im.outputFile(data_uri, infImgPath)
                .then(val => {
                    getAllFacesImageDescriptor(faceapi, document, infImgPath, modelsDir)
                        .then(descriptors => {
                            h.logger.log("Descriptors: ");
                            h.logger.log(descriptors);

                            gDescriptors = descriptors;

                            if (!descriptors.length) {
                                h.logger.log("No face(s) found");
                                return;
                            }

                            descriptors.forEach(d => {
                                const bestMatch = faceMatcher.findBestMatch(d.descriptor);

                                h.logger.log("Best match: ");
                                h.logger.log(bestMatch.toString());
                            });

                            descriptorCounter++;
                            h.logger.log(`Descriptors: ${descriptorCounter}`);
                        })
                        .catch(err => {
                            h.logger.log("Got an error while evaluating the descriptor: ");
                            h.logger.log(err);
                        });
                })
                .catch(err => h.logger.log(`Got an error while saving the file: ${err}`));
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

function initFaceMatcher() {
    // Create an array containing all the descriptors from the tray
    // Initiliaze the FaceMatcher with all the descriptors

    let labeledDescriptors = [];

    imageTitles.forEach(title => {
        if ( imagesData[title].descriptor ) {
            labeledDescriptors.push(
                new faceapi.LabeledFaceDescriptors(
                    title,
                    [ new Float32Array(Object.values(imagesData[title].descriptor.descriptor)) ]
                )
            );
        }
    });

    h.logger.log(labeledDescriptors);
    h.logger.log("Initializing FaceMatcher...");

    faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);

    h.logger.log("FaceMatcher: ");
    h.logger.log(faceMatcher);
}
