const h = require("./../../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "switchPage",
    "fs"
]);

$(() => {
    $("#back-btn").click(() => h.switchPage(fadeOutRight, "field.html", true));

    let ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
    let draw = function(video, dt) {
      ctx.drawImage(video, 0, 0);
    }
    let myCamvas = new camvas(ctx, draw);

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
