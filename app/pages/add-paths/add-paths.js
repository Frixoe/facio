const h = require("./../../helpers/getRendererModules")(false, false, [
    "stores",
    "logger",
    "switchPage",
    "ipc"
]);

let scriptsPath = h.stores.paths.get("scriptsPath");
let traysPath = h.stores.paths.get("traysPath");

$(() => {
    if (h.stores.haspaths.get("hasScriptsPath"))
        $("#scripts-path-val-field").val(scriptsPath);
    if (h.stores.haspaths.get("hasTraysPath"))
        $("#trays-path-val-field").val(traysPath);

    $(".my-input-labels").attr({
        style: "font-family: 'montserratSemiBold'; height: 10px;"
    });

    $(".button-div").attr({
        style: "margin-top: 15px;"
    });

    $("#scripts-btn").click(e => {
        e.preventDefault();
        chooseDirectory()
            .then(val => {
                scriptsPath = val[0];
                $("#scripts-path-val-field").val(val[0]);
            })
            .catch(err => {
                h.logger.error(err);
            });
    });

    $("#trays-btn").click(e => {
        e.preventDefault();
        chooseDirectory()
            .then(val => {
                traysPath = val[0];
                $("#trays-path-val-field").val(val[0]);
            })
            .catch(err => {
                h.logger.error(err);
            });
    });

    $("#apply-changes-btn").click(e => {
        e.preventDefault();

        h.stores.paths.set("scriptsPath", scriptsPath);
        h.stores.paths.set("traysPath", traysPath);

        h.switchPage(exitAnim, "index.html");
    });

    $(".container")
        .show()
        .addClass("fadeInDown animated");
});

function exitAnim() {
    $(".container")
        .removeClass(["animated", "fadeInDown"])
        .addClass("fadeOutUp animated");
}

async function chooseDirectory() {
    return await h.ipc.callMain("open-directory-dialog", "");
}
