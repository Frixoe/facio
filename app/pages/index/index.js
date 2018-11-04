const h = require("./../../helpers/getRendererModules")(false, false, ["logger", "stores", "remote", "switchPage"]);
const chokidar = h.remote.require("chokidar");

h.logger.log("loaded 'index.html'");

$(() => {
    let hasSP = h.stores.haspaths.get("hasScriptsPath");
    let hasTP = h.stores.haspaths.get("hasTraysPath");

    if ((!hasSP || !hasTP) && !h.stores.state.get("isFirstLaunch")) {
        require("./../../helpers/makePathsErrorToasts");
    }

    // Creating a watcher to watch the msgstore.
    let watcher = chokidar.watch(h.stores.msgstore.path);

    watcher
    .on("ready", () => h.logger.log("now watching msgstore in :" + h.stores.state.get("currentPage")))
    .on("all", (event, path) => {
        let msg = h.stores.msgstore.get("msg");

        if (msg === "trays-dir-empty") {
            $("#field-btn").prop("disabled", true);
            $("#data-entry-btn").prop("disabled", false);
        }

        if (msg === "trays-dir-deleted") {
            $("#field-btn").prop("disabled", true);
            $("#data-entry-btn").prop("disabled", true);

            require("./../../helpers/makePathsErrorToasts");
        }

        if (msg === "path(s)-changed") {
            if (!h.stores.haspaths.get("hasScriptsPath") || !h.stores.haspaths.get("hasTraysPath")) {
                h.logger.log("paths were changed and they don't exist any more, making toasts now...");

                if (!h.stores.haspaths.get("hasTraysPath")) {
                    $("#field-btn").prop("disabled", true);
                    $("#data-entry-btn").prop("disabled", true);
                }

                require("./../../helpers/makePathsErrorToasts");
            }
        }

        h.stores.msgstore.set("msg", "");
    });

    h.logger.log("hasSP: " + hasSP);
    h.logger.log("hasTP: " + hasTP);
    h.logger.log("hasTLOT: " + h.stores.state.get("hasAtLeastOneTray"));

    if (!hasTP) $("#data-entry-btn").prop("disabled", true);
    if (!hasTP || !h.stores.state.get("hasAtLeastOneTray")) $("#field-btn").prop("disabled", true);

    $("#field-btn")
    .removeClass(["waves-dark"])
    .addClass("waves-green");

    $("#data-entry-btn").click(() => {
        // Load the data collection mode file.
        h.switchPage(exitAnim1, "tcae.html");
        M.Toast.dismissAll();
        watcher.close();
    });

    $("#field-btn").click(() => {
        // Load the field mode file.
        h.switchPage(exitAnim2, "field.html");
        M.Toast.dismissAll();
        watcher.close();
    });

    $("#edit-paths-btn").click(() => {
        h.switchPage(exitAnim3, "add-paths.html");
        M.Toast.dismissAll();
        watcher.close();
    });

    $(".container").show().addClass("fadeIn animated");
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