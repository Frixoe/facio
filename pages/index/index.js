var helper = require("./../../helpers/getRendererModules")();
require("./../../helpers/addJqueryToHTML");

helper.logger.log("loaded 'index.html'");

$(() => {
    $("#heading").attr("style", "font-family: 'montserratBoldItalic'; height: 40px;")

    $("button")
    .addClass("btn teal waves-effect waves-light my-btn")
    .attr("style", "width: 200px;");

    $("body").attr("style", "overflow: hidden;");

    $(".right").click(() => {
        // Load the data collection mode file.
        helper.switchPage(helper, exitAnim, "choices.html");
    });

    $(".left").click(() => {
        // Load the field mode file.
        helper.switchPage(helper, exitAnim, "f.html");
    });
});

function exitAnim()
{
    $(".container").removeClass(["animated", "fadeInLeft"]).addClass("fadeOutRight animated");
}