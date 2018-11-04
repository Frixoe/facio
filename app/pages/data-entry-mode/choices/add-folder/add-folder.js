const h = require("./../../../../helpers/getRendererModules")(false, false, [
    "logger",
    "switchPage"
]);

h.logger.log("loaded 'add-folder.html'");

$(() => {
    $("#back-btn").click(() => h.switchPage(fadeOutLeft, "choices.html"));

    $(".container").show().addClass("fadeInLeft animated");
});

function fadeOutLeft() {
    $(".container").removeClass(["animated", "fadeInLeft"]).addClass("fadeOutLeft animated");
}