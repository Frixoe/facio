const h = require("./../../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "switchPage",
    "fs"
]);

$(() => {
    $("#back-btn").click(() => h.switchPage(fadeOutRight, "field.html", true));

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
