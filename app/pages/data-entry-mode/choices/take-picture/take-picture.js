const h = require("./../../../../helpers/getRendererModules")(false, false, [
    "logger",
    "switchPage"
]);

const WebCam = require("webcamjs");

h.logger.log("loaded 'take-picture.html'");

$(() => {
    WebCam.set({
        width: 400,
        height: 400,
        fps: 30
    })
    WebCam.attach("#video");

    $("#take-snap").click(() => {
        WebCam.snap(uri => {
            document.getElementById("snap").src = uri;
        });
    });
    
    $("#back-btn").click(() => h.switchPage(fadeOutLeft, "choices.html"));

    $(".container").show().addClass("fadeInLeft animated");
});

function fadeOutLeft() {
    $(".container").removeClass(["animated", "fadeInLeft"]).addClass("fadeOutLeft animated");
}