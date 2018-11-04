const h = require("./../../../helpers/getRendererModules")(
    false,
    false,
    ["logger", "switchPage", "stores"]
);

h.logger.log("loaded 'choices.html'");

let nextPages = ["add-picture.html", "take-picture.html", "add-folder.html"];

$(() => {
    $("#take-picture-btn").click(() => h.switchPage(fadeOutRight, "take-picture.html"));
    $("#add-picture-btn").click(() => h.switchPage(fadeOutRight, "add-picture.html"));
    $("#add-folder-btn").click(() => h.switchPage(fadeOutRight, "add-folder.html"));

    $("#back-btn").click(() => h.switchPage(fadeOutLeft, "tcae.html"));

    if (nextPages.indexOf(h.stores.state.get("prevPage")) !== -1) $(".container").show().addClass("fadeInRight animated");
    else $(".container").show().addClass("fadeInLeft animated");    
});

function fadeOutLeft() {
    $(".container").removeClass(["animated", "fadeInLeft"]).addClass("fadeOutLeft animated");
}

function fadeOutRight() {
    $(".container").removeClass(["animated", "fadeInLeft"]).addClass("fadeOutRight animated");
}