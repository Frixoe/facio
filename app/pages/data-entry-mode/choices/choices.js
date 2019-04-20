const keys = require("./../../../keys");
const Store = require("electron-store");
const isTrayDataless = require("./../../../helpers/isTrayDataless");
const h = require("./../../../helpers/getRendererModules")(false, false, [
    "logger",
    "switchPage",
    "stores",
    "fs"
]);

h.logger.log("loaded 'choices.html'");

let nextPages = [
    "add-picture.html",
    "take-picture.html",
    "add-folder.html",
    "etp.html"
];
let curTray = new Store({
    name: h.stores.state.get("currentTray"),
    cwd: h.stores.paths.get("traysPath"),
    fileExtension: keys.traysExtension
});

function disableAllBtns() {
    $("#take-picture-btn").prop("disabled", true);
    $("#add-picture-btn").prop("disabled", true);
    $("#add-folder-btn").prop("disabled", true);
}

$(() => {
    h.stores.state.set("allowDataFieldPersistence", false);
    h.stores.state.set("eidMode", "");

    if (h.stores.msgstore.get("msg") === "folder-supported-imgs-not-found") {
        h.stores.msgstore.set("msg", "");

        M.toast({
            html: `
                The files/imgs in that folder are not supported.
            `,
            displayLength: 5000,
            inDuration: 1000,
            outDuration: 1000,
            classes: "my-toast"
        });

        let supExts = [];

        keys.supportedImgExtensions.forEach((ext, ind, arr) =>
            supExts.push("." + ext)
        );

        M.toast({
            html: `
                Supported extensions: ${supExts.join(", ")}
            `,
            displayLength: 5000,
            inDuration: 1000,
            outDuration: 1000,
            classes: "my-toast"
        });
    }

    // Creating a watcher for safety.
    let watcher = require("chokidar").watch(h.stores.msgstore.path);

    h.stores.msgstore.set("msg", "");

    watcher
        .on("ready", () =>
            h.logger.log("now watching msgstore in: 'choices.html'")
        )
        .on("all", (event, path) => {
            let msg = h.stores.msgstore.get("msg");

            h.logger.log("msg: " + msg);

            if (msg === "") return;

            if (msg === "tray-deleted") {
                h.logger.log("a tray was just deleted...");

                // Check if the tray deleted was the current tray...

                if (
                    !h.fs.existsSync(
                        require("path").join(
                            h.stores.paths.get("traysPath"),
                            h.stores.state.get("currentTray")
                        )
                    )
                ) {
                    disableAllBtns();

                    M.toast({
                        html: `
                        This tray was deleted... Taking you back...
                    `,
                        completeCallback: () =>
                            h.switchPage(fadeOutLeft, "tcae.html"),
                        displayLength: 3000,
                        inDuration: 1000,
                        outDuration: 1000,
                        classes: "my-toast"
                    });
                }
            }

            if (msg === "trays-dir-empty") {
                h.logger.log("the trays dir was emptied...");
                // Disable all the btns.
                // Take the user back to tcae.html

                disableAllBtns();

                M.toast({
                    html: `
                    All trays were deleted... Please add at least one tray to continue...
                `,
                    completeCallback: () =>
                        h.switchPage(fadeOutLeft, "tcae.html"),
                    displayLength: 3000,
                    inDuration: 1000,
                    outDuration: 1000,
                    classes: "my-toast"
                });
            }

            if (msg === "trays-dir-deleted") {
                h.logger.log("the trays dir was deleted...");

                // Disable all the btns.
                // Take the use back to index.html

                disableAllBtns();

                M.toast({
                    html: `
                    The trays directory was deleted... Taking you to the start page...
                `,
                    completeCallback: () =>
                        h.switchPage(fadeOutLeft, "index.html"),
                    displayLength: 3000,
                    inDuration: 1000,
                    outDuration: 1000,
                    classes: "my-toast"
                });
            }

            h.stores.msgstore.set("msg", "");
        });

    $("#take-picture-btn").click(() =>
        h.switchPage(fadeOutRight, "take-picture.html")
    );
    $("#add-picture-btn").click(() => {
        h.stores.state.set("eidMode", "add-picture");
        h.switchPage(fadeOutRight, "add-picture.html")
    });
    $("#add-folder-btn").click(() => {
        h.stores.state.set("eidMode", "folder");
        h.switchPage(fadeOutRight, "add-folder.html");
    });
    $("#edit-tray-btn").click(() => h.switchPage(fadeOutRight, "etp.html"));

    if (isTrayDataless(h, curTray, keys)) {
        $("#edit-tray-btn").prop("disabled", true);

        M.toast({
            html: `
                No data exists on this tray. Please add some.
            `,
            displayLength: 5000,
            inDuration: 1000,
            outDuration: 1000,
            classes: "my-toast"
        });
    }

    $("#back-btn").click(() => h.switchPage(fadeOutLeft, "tcae.html"));

    if (nextPages.indexOf(h.stores.state.get("prevPage")) !== -1)
        $(".container")
            .show()
            .addClass("fadeInRight animated");
    else
        $(".container")
            .show()
            .addClass("fadeInLeft animated");
});

function fadeOutLeft() {
    $(".container")
        .removeClass(["animated", "fadeInLeft"])
        .addClass("fadeOutLeft animated");
}

function fadeOutRight() {
    $(".container")
        .removeClass(["animated", "fadeInLeft"])
        .addClass("fadeOutRight animated");
}
