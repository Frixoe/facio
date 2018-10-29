var h = require("./../../helpers/getRendererModules")();

h.logger.log("loaded 'index.html'");

$(() => {
    let hasSP = h.stores.paths.get("hasScriptsPath");
    let hasTP = h.stores.paths.get("hasTraysPath");

    if ((!hasSP || !hasTP) && !h.stores.state.get("isFirstLaunch")) {
        require("./../../helpers/makePathsErrorToasts");
    }

    h.logger.log("hasSP: " + hasSP);
    h.logger.log("hasTP: " + hasTP);
    h.logger.log("hasTLOT: " + h.stores.state.get("hasAtLeastOneTray"));
    
    if (!hasTP || !h.stores.state.get("hasAtLeastOneTray")) $("#field-btn").prop("disabled", true);

    // Shorten the distance between the buttons and the heading.
    $("#heading").attr("style", "height: 40px;");

    $("#field-btn")
    .removeClass(["waves-dark"])
    .addClass("waves-green");

    $("body").attr("style", "overflow: hidden;");

    $("#data-entry-btn").click(() => {
        // Load the data collection mode file.
        if (hasSP && hasTP) h.switchPage(h, exitAnim1, "tcae.html");
        else h.switchPage(h, exitAnim3, "add_paths.html");
        M.Toast.dismissAll();
    });

    $("#field-btn").click(() => {
        // Load the field mode file.
        h.switchPage(h, exitAnim2, "field.html");
        M.Toast.dismissAll();
    });
});

function exitAnim1() {
    $(".container").removeClass(["animated", "fadeInLeft"]).addClass("fadeOutRight animated");
}

function exitAnim2() {
    $(".container").removeClass(["animated", "fadeInLeft"]).addClass("fadeOutLeft animated");
}

function exitAnim3() {
    $(".container").removeClass(["animated", "fadeInLeft"]).addClass("fadeOutDown animated");
}