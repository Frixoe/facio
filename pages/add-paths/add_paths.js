var h = require("./../../../helpers/getRendererModules")();

$(() => {
});

function exitAnim() {
    $(".container").removeClass(["animated", "fadeInDown"]).addClass("fadeOutUp animated");
}