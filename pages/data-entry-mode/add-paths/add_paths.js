var h = require("./../../../helpers/getRendererModules")();
require("./../../../helpers/addJqueryToHTML");
require("./../../../helpers/performChecks")(h);

$(() => {
});

function exitAnim() {
    $(".container").removeClass(["animated", "fadeInDown"]).addClass("fadeOutUp animated");
}