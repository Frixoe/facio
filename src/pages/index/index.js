const h = require("./../../helpers/getRendererModules")(false, false, ["logger", "stores", "remote", "switchPage"]);
const chokidar = h.remote.require("chokidar");

h.logger.log("loaded 'index.html'");

$(() => {
    let watcher = chokidar.watch(h.stores.pathchangestore.path);
    watcher.on("ready", () => h.logger.log("now watching in :" + h.stores.state.get("currentPage")))
    .on("all", path => {
        if (!h.stores.haspaths.get("hasScriptsPath") || !h.stores.haspaths.get("hasTraysPath")) {
            h.logger.log("paths were changed, making toasts now...");

            if (!h.stores.haspaths.get("hasTraysPath")) $("#field-btn").prop("disabled", true);
            else $("#field-btn").prop("disabled", false);

            require("./../../helpers/makePathsErrorToasts");
        }
    });

    let hasSP = h.stores.haspaths.get("hasScriptsPath");
    let hasTP = h.stores.haspaths.get("hasTraysPath");

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
        if (h.stores.haspaths.get("hasScriptsPath") && h.stores.haspaths.get("hasTraysPath")) h.switchPage(exitAnim1, "tcae.html");
        else h.switchPage(exitAnim3, "add_paths.html");
        M.Toast.dismissAll();
    });

    $("#field-btn").click(() => {
        // Load the field mode file.
        h.switchPage(exitAnim2, "field.html");
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