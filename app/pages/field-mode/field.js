const h = require("./../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "switchPage"
]);

$(() => {
    $("#back-btn").click(() => {
        h.switchPage(fadeOutRight, "index.html");
    });

    $(".container")
        .show()
        .addClass("fadeInRight animated");
});

function fadeOutRight() {
    $(".container")
        .removeClass(["animated", "fadeInRight"])
        .addClass("fadeOutRight animated");
}
