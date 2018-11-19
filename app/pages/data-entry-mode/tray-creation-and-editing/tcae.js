const Store = require("electron-store");
const path = require("path");

const h = require("./../../../helpers/getRendererModules")(false, false, [
    "logger",
    "fs",
    "stores",
    "switchPage",
    "remote",
    "Window"
]);
const trayAlreadyExists = require("./../../../helpers/trayAlreadyExists");
const getAllTrays = require("./../../../helpers/getAllTrays");
const isValid = require("./../../../helpers/isVaildName");

function getPickBtnString(tray) {
    return `Pick a tray: ${tray.replace(".ftray", "")} Selected`;
}

function getTrayDropdownHtml(tray) {
    return `<li class="trays-dropdown-elements" id="${"my-tray-" +
        tray.replace(".ftray", "")}"><a href="#">${tray}</a></li>`;
}

function resetBtns() {
    $("#pick-a-tray-btn").html(getPickBtnString("None.ftray"));
    $("#pick-a-tray-btn").prop("disabled", true);
    $("#delete-tray-btn").prop("disabled", true);
    $("#modify-tray-btn").prop("disabled", true);
}

async function deleteTrayToast(currentTray) {
    var delT = M.toast({
        html: `
            <span>
                ${currentTray} was successfully deleted!
            </span>
            <button class="del-tray-toast-btns btn-flat toast-action">Ok</button>
        `,
        displayLength: 6000,
        inDuration: 1000,
        outDuration: 1000,
        classes: "my-toast"
    });

    $(".del-tray-toast-btns").click(() => {
        M.Toast.dismissAll();
    });
}

async function addTrayToast(entry) {
    var sucT = M.toast({
        html: `
        <span>
            Success, "${entry}" has been added to the trays directory!
        </span>
        <button class="success-toasts-btns btn-flat toast-action">Got it</button>
        `,
        displayLength: 6000,
        inDuration: 1000,
        outDuration: 1000,
        classes: "my-toast"
    });

    $(".success-toasts-btns").click(() => {
        sucT.dismiss();
    });
}

async function trayAlreadyExistsToast(entry) {
    var t3 = M.toast({
        html: `
        <span>
            "${entry}" already exists. Please try again with another name
        </span>
        <button id="err-btn-3" class="btn-flat toast-action">Got it</button>
        `,
        displayLength: 6000,
        inDuration: 1000,
        outDuration: 1000,
        classes: "my-toast"
    });

    $("#err-btn-3").click(() => {
        t3.dismiss();
    });
}

async function invalidTrayNameToasts() {
    $("#create-new-tray-input").val("");

    M.updateTextFields();

    var t1 = M.toast({
        html: `<span>
            That is an invalid tray name
        </span>
        <button class="err-btn-1 btn-flat toast-action">Ok</button>
        `,
        displayLength: 6000,
        inDuration: 1000,
        outDuration: 1000,
        classes: "my-toast"
    });

    var t2 = M.toast({
        html: `<span>
            Only letters from the alphabet are accepted.
        </span>
        <button class="err-btn-2 btn-flat toast-action">Got it</button>
        `,
        displayLength: 6000,
        inDuration: 1000,
        outDuration: 1000,
        classes: "my-toast"
    });

    $(".err-btn-1").click(() => {
        t1.dismiss();
    });

    $(".err-btn-2").click(() => {
        t2.dismiss();
    });
}

async function noTrayNameEnteredToast() {
    var t0 = M.toast({
        html: `
        <span>
            Cannot add a tray without a name
        </span>
        <button class="err-btn-0 btn-flat toast-action">Ok</button>
        `,
        displayLength: 6000,
        inDuration: 1000,
        outDuration: 1000,
        classes: "my-toast"
    });

    $(".err-btn-0").click(() => {
        t0.dismiss();
    });
}

async function removeAllDropdownElements() {
    $(".trays-dropdown-elements").remove();

    resetBtns();
}

// When deleting a tray by pressing the delete btn, chokidar emits an "unlink" event which is
// unnecessary when the delete btn is pressed.
// These booleans help prevent the extra overhead of reloading the dropdown everytime
// the delete or the add btn is pressed.
// For some reason, when adding a new tray, chokidar also emits an "unlink" event.
// To prevent that, appIsAdding is set to true.
var appIsDeleting = false;
var appIsAdding = true;

$(() => {
    if (h.stores.state.get("hasAtLeastOneTray"))
        $("#pick-a-tray-btn").prop("disabled", false);

    let ddContainer = document.getElementById("dropdown-container");
    let dropdownT = document.querySelector(".dropdown-trigger");
    let dropdownInstance;

    async function updateDropdown() {
        $("#pick-a-tray-btn").html(getPickBtnString("None.ftray"));
        $("#trays-dropdown").html("");

        getAllTrays(h).forEach(tray => {
            $("#trays-dropdown").append(getTrayDropdownHtml(tray));
        });

        dropdownInstance = M.Dropdown.init(dropdownT, {
            alignment: "right",
            autoTrigger: false,
            contrainWidth: true,
            container: ddContainer,
            coverTrigger: false,
            closeOnClick: true,
            inDuration: 150,
            outDuration: 150
        });
        dropdownInstance.isScrollable = true;
        dropdownInstance.focusedIndex = 0;

        $("#trays-dropdown")
            .children("li")
            .click(e => {
                h.logger.log(e.target.innerHTML);

                $("#pick-a-tray-btn").html(
                    getPickBtnString(e.target.innerHTML)
                );

                h.stores.state.set(
                    "currentTray",
                    e.target.innerHTML.replace(".ftray", "")
                );
                $("#delete-tray-btn").prop("disabled", false);
                $("#modify-tray-btn").prop("disabled", false);
            });
    }
    updateDropdown();

    let watcher = require("chokidar").watch(h.stores.msgstore.path);
    watcher
        .on("ready", () =>
            h.logger.log(
                "now watching msgstore in: " + h.stores.state.get("currentPage")
            )
        )
        .on("all", (event, path) => {
            let msg = h.stores.msgstore.get("msg");

            if (msg === "") return;

            h.logger.log(
                "deleteBtnPressed: " +
                    appIsDeleting +
                    " addBtnPressed: " +
                    appIsAdding
            );

            if (msg === "tray-added")
                $("#pick-a-tray-btn").prop("disabled", false);

            if (msg === "tray-deleted") {
                if (appIsAdding || appIsDeleting) return;

                var trayDelMan = M.toast({
                    html: `
                    <span>
                        A tray was deleted manually while the app was open. Updating the trays list...
                    </span>
                    <button id="manually-deleted-tray-toast" class="btn-flat toast-action">Got it</button>
                `,
                    displayLength: 6000,
                    inDuration: 1000,
                    outDuration: 1000,
                    classes: "my-toast"
                });

                $("#manually-deleted-tray-toast").click(() => {
                    trayDelMan.dismiss();
                });

                h.logger.log("tray deleted manually. updating dropdown...");

                resetBtns();
                updateDropdown();
            }

            if (msg === "trays-dir-empty") {
                M.toast({
                    html: "The trays directory is now empty",
                    displayLength: 2000,
                    inDuration: 1000,
                    outDuration: 1000,
                    classes: "my-toast"
                });

                resetBtns();
            }

            if (msg === "trays-dir-deleted") {
                removeAllDropdownElements();

                var tdd = M.toast({
                    html: `
                    <span>
                        The trays directory was deleted, redirecting you to the start page to add a new directory.
                    </span>
                    <button class="trays-dir-deleted-toast-btns btn-flat toast-action"></button>
                `,
                    completeCallback: () => {
                        h.switchPage(fadeOutLeft, "index.html");
                        h.logger.log("going to index.html");
                    },
                    displayLength: 6000,
                    inDuration: 1000,
                    outDuration: 1000,
                    classes: "my-toast"
                });

                $(".trays-dir-deleted-toast-btns").click(() => {
                    tdd.dismiss();
                });
            }

            h.stores.msgstore.set("msg", "");

            h.logger.log("msg: " + msg);

            if (appIsDeleting) appIsDeleting = false;
        });

    $("#back-btn").click(() => {
        h.switchPage(fadeOutLeft, "index.html", false);
    });

    $("#modify-tray-btn").click(() => {
        h.switchPage(fadeOutRight, "choices.html");
    });

    $("#delete-tray-btn").click(e => {
        if (!h.stores.haspaths.get("hasTraysPath"))
            require("./../../../helpers/makePathsErrorToasts");
        else {
            appIsDeleting = true;

            let currentTray = h.stores.state.get("currentTray") + ".ftray";
            let pathToUnlink = path.join(
                h.stores.paths.get("traysPath"),
                currentTray
            );

            h.logger.log("deleting " + currentTray + "...");

            // This has been handled by the watcher, but just in case.
            try {
                h.fs.unlinkSync(pathToUnlink);
            } catch (err) {
                h.logger.log("file doesn't exist...");

                var couldNotDelete = M.toast({
                    html: `
                        <span>
                            Error: That file couldn't be deleted. Please check if that file exists in the trays folder.
                        </span>
                        <button class="could-not-delete-toast-btns btn-flat toast-action">Ok</button>
                    `,
                    displayLength: 6000,
                    inDuration: 1000,
                    outDuration: 1000,
                    classes: "my-toast"
                });

                $(".could-not-delete-toast-btns").click(() => {
                    couldNotDelete.dismiss();
                });

                h.logger.log("aborting delete...");
                updateDropdown();
                return;
            }

            h.logger.log("deleted " + currentTray);

            h.stores.state.set("currentTray", "");

            $("#my-tray-" + currentTray.replace(".ftray", "")).remove();
            $("#pick-a-tray-btn").html(getPickBtnString("None.ftray"));

            $("#delete-tray-btn").prop("disabled", true);
            $("#modify-tray-btn").prop("disabled", true);

            deleteTrayToast(currentTray);
        }
    });

    $("#add-tray-btn").click(e => {
        appIsAdding = true;
        e.preventDefault();

        let entry = $("#create-new-tray-input").val();

        h.logger.log("tray name entered: " + entry);

        if (!entry) {
            noTrayNameEnteredToast();
            return;
        }

        if (!isValid(entry)) {
            invalidTrayNameToasts();
            return;
        }

        if (!h.stores.haspaths.get("hasTraysPath")) {
            require("./../../../helpers/makePathsErrorToasts");
            return;
        }

        if (trayAlreadyExists(h, entry)) {
            trayAlreadyExistsToast(entry);
            return;
        }

        addTrayToast(entry);

        let newTray = new Store({
            name: entry,
            cwd: h.stores.paths.get("traysPath"),
            fileExtension: require("./../../../keys").traysExtension
        });
        newTray.clear();
        newTray.set("title", entry);

        $("#create-new-tray-input").val("");

        M.updateTextFields();
        updateDropdown();
    });

    if (h.stores.state.get("prevPage") === "choices.html")
        $(".container")
            .show()
            .addClass("fadeInRight animated");
    else
        $(".container")
            .show()
            .addClass("fadeInLeft animated");
});

function removeClassForAnim() {
    return $(".container").removeClass(["animated", "fadeInLeft"]);
}

function fadeOutRight() {
    removeClassForAnim().addClass("fadeOutRight animated");
}

function fadeOutLeft() {
    removeClassForAnim().addClass("fadeOutLeft animated");
}
