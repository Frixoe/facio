var helper = require("./../../helpers/getRendererModules")();
require("./../../helpers/addJqueryToHTML");
require("./../../helpers/performChecks")(helper);

helper.logger.log("loaded 'index.html'");

$(() => {
    let hasSP = helper.stores.paths.get("hasScriptsPath");
    let hasTP = helper.stores.paths.get("hasTraysPath");

    if ((!hasSP || !hasTP) && !helper.stores.state.get("isFirstLaunch")) {
        $(".error-row").show();
        $(".error-text").html("ERROR: Either the path to the scripts folder or the trays folder is wrong/doesn't exist any more.");
    }

    helper.logger.log("hasSP: " + hasSP);
    helper.logger.log("hasTP: " + hasTP);
    helper.logger.log("hasTLOT: " + helper.stores.state.get("hasAtLeastOneTray"));
    
    if (!hasTP || !helper.stores.state.get("hasAtLeastOneTray")) $(".left").prop("disabled", true);

    $("#heading").attr("style", "font-family: 'montserratBoldItalic'; height: 40px;")

    $("button")
    .addClass("btn teal waves-effect waves-light my-btn")
    .attr("style", "width: 200px;");

    $("body").attr("style", "overflow: hidden;");

    $(".right").click(() => {
        // Load the data collection mode file.
        if (hasSP && hasTP) helper.switchPage(helper, exitAnim1, "tcae.html");
        else helper.switchPage(helper, exitAnim3, "add_paths.html");
    });

    $(".left").click(() => {
        // Load the field mode file.
        helper.switchPage(helper, exitAnim2, "field.html");
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
