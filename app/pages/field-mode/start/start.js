const path = require("path");
const os = require("os");
const wc = require("webcamjs");
const im = require("image-data-uri");
const uuidv4 = require("uuid/v4");
const getAllFacesImageDescriptor = require("./../../../helpers/getAllFacesImageDescriptor");
const h = require("./../../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "switchPage",
    "fs"
]);

let divWidth = window.innerWidth;
let divHeight = window.innerHeight;
let tempPath = "facioUnsavedImgs";
let modelsDir = "./../../../assets/models";

h.logger.log("window dims: " + window.innerWidth + " " + window.innerHeight);

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