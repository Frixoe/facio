var h = require("./../../helpers/getRendererModules")();

var scriptsPath = h.stores.paths.get("scriptsPath");
var traysPath = h.stores.paths.get("traysPath");

$(() => {
    if (h.stores.paths.get("hasScriptsPath")) $("#scripts-path-val-field").val(scriptsPath);
    if (h.stores.paths.get("hasTraysPath")) $("#trays-path-val-field").val(traysPath);

    $(".my-input-labels").attr({
        style: "font-family: 'montserratSemiBold'; height: 10px;"
    });

    $(".button-div").attr({
        style: "margin-top: 15px;"
    });

    $("#scripts-btn").click(e => {
        e.preventDefault();
        chooseDirectory().then(val => {
            scriptsPath = val[0];
            $("#scripts-path-val-field").val(val[0]);
        }).catch(err => {
            h.logger.error(err);
        });
    });

    $("#trays-btn").click(e => {
        e.preventDefault();
        chooseDirectory().then(val => {
            traysPath = val[0];
            $("#trays-path-val-field").val(val[0]);
        }).catch(err => {
            h.logger.error(err);
        });
    });

    $("#apply-changes-btn").attr({
        style: "width: 220px; height: 40px;"
    }).click(e => {
        e.preventDefault();

        h.stores.paths.set("scriptsPath", scriptsPath);
        h.stores.paths.set("traysPath", traysPath);

        h.switchPage(h, exitAnim, "index.html");
    });
});

function exitAnim() {
    $(".container").removeClass(["animated", "fadeInDown"]).addClass("fadeOutUp animated");
}

async function chooseDirectory() {
    return await h.ipc.callMain("open-dialog", "");
}