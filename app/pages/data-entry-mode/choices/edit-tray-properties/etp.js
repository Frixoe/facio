const chokidar = require("chokidar");
const Store = require("electron-store");

const keys = require("./../../../../keys");
const getAllScripts = require("./../../../../helpers/getAllScripts");
// const isValidName = require("./../../../../helpers/isValidName");
const h = require("./../../../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "switchPage",
    "fs"
]);

let curTray = new Store({
    name: h.stores.state.get("currentTray"),
    cwd: h.stores.paths.get("traysPath"),
    fileExtension: keys.traysExtension
});

h.logger.log(curTray);

let traysExtension = keys.traysExtension;
let scriptsDropdownInstance = null;
let deleteConfirmationModalInstance = null;
let curTrayDataDuplicate = curTray.get("imagesData");
let selectedImageTitle = null;
let selectedScript = null;
let defaultImageTitle = null;
let defaultScript = null;
let aTrayIsSelected = false;

function updateScriptsDropdown() {
    $("#scripts-dropdown")
        .html("")
        .append(
            `
            <li class="my-scripts-dropdown-elements"><a href="#!">None</a></li>
            <li class="divider" tabindex="-1"></li>
        `
        );

    getAllScripts(h).forEach(script => {
        $("#scripts-dropdown").append(
            `
                <li class="my-scripts-dropdown-elements">
                    <a href="#!">
                        ${script}
                    </a>
                </li>
            `
        );
    });

    // Initialize the dropdown.
    var dropdown = document.querySelector(".dropdown-trigger");
    scriptsDropdownInstance = M.Dropdown.init(dropdown, {
        constrainWidth: true,
        coverTrigger: true
    });

    scriptsDropdownInstance.isScrollable = true;
    scriptsDropdownInstance.focusIndex = 0;

    $(".my-scripts-dropdown-elements").click(e => {
        h.logger.log(
            "cilcked on li element with innerHTML: " + e.target.innerHTML
        );
        let scriptVal = e.target.innerHTML.trim();

        if (!aTrayIsSelected) return;

        $("#scripts-input-field").val(scriptVal);
        selectedScript = scriptVal;

        updateApplyBtnState();
    });
}

function updateDataCollection() {
    h.logger.log("updating data collection");

    $("#collection-items")
        .children()
        .remove();

    let keys = Object.keys(curTrayDataDuplicate);

    h.logger.log(keys);

    if (keys.length === 0) {
        $("#tray-title-input-field").val("");
        updateScriptsDropdown();

        $("#collection-items").append(
            `
            <li class="collection-item center-align" id="collection-none-item">
                <span class="collection-items-img-title">
                    NONE
                </span>
            </li>
            `
        );
    }

    keys.forEach((imgTitle, ind, arr) => {
        $("#collection-items").append(
            `
                <li class="collection-item truncate valign-wrapper">
                    <span class="collection-items-img-title">
                        ${imgTitle}
                    </span>
                    <button style="width: 100px; margin-top: 0px; margin-right: -16px; border-radius: 20px; font-family: 'montserratSemiBold';" class="btn-flat right collection-items-btns hoverable">
                        DELETE
                    </button>
                </li>
            `
        );
    });

    $(".collection-item").click(e => {
        h.logger.log(e);

        if (e.currentTarget.id === "collection-none-item") {
            aTrayIsSelected = false;
            return;
        }

        let btnPressed = $(e.target).hasClass("collection-items-btns");

        $(".collection-item").removeClass("active");
        $(".collection-items-btns").css("color", "black");

        e.currentTarget.classList.add("active");
        $(e.currentTarget)
            .find(".collection-items-btns")
            .css("color", "white");

        let imgTitle = $(e.currentTarget)
            .children()
            .first()
            .html()
            .trim();
        defaultImageTitle = imgTitle;
        defaultScript = curTrayDataDuplicate[imgTitle].script;

        if (!defaultScript) defaultScript = "";

        selectedImageTitle = defaultImageTitle;
        selectedScript = defaultScript;
        h.logger.log(imgTitle);

        if (btnPressed) {
            h.logger.log("pressed delete btn");

            $("#image-title-delete-confirmation-modal-placeholder").html(
                defaultImageTitle
            );
            $("#tray-name-delete-confirmation-modal-placeholder").html(
                curTray.get("title") + "." + traysExtension
            );

            deleteConfirmationModalInstance.open();
            return;
        }

        $("#tray-title-input-field").val(imgTitle);
        $("#scripts-input-field").val(defaultScript);

        $("input").prop("disabled", false);

        aTrayIsSelected = true;

        updateApplyBtnState();
    });
    $("input").prop("disabled", true);
}

function updateApplyBtnState() {
    selectedImageTitle = $("#tray-title-input-field").val();
    selectedScript = $("#scripts-input-field").val();

    let imgTitleChanged = selectedImageTitle !== defaultImageTitle;
    let imgScriptChanged = selectedScript !== defaultScript;

    h.logger.log("defaultScript: " + defaultScript);
    h.logger.log("selectedScript: " + selectedScript);

    h.logger.log("img defTitle: " + defaultImageTitle);
    h.logger.log("img selTitle: " + selectedImageTitle);

    h.logger.log("img title changed: " + imgTitleChanged);
    h.logger.log("img script changed: " + imgScriptChanged);

    if (imgTitleChanged || (imgScriptChanged && aTrayIsSelected)) {
        $("#apply-changes-btn").prop("disabled", false);
    } else $("#apply-changes-btn").prop("disabled", true);
}

function resetFields() {
    $("input").val("");
}

$(() => {
    updateScriptsDropdown();

    updateDataCollection();

    let msgstoreWatcher = chokidar.watch(h.stores.msgstore.path);

    msgstoreWatcher
        .on("ready", () => h.logger.log("msgstorewatcher reporting for duty!"))
        .on("all", (event, path) => {
            let msg = h.stores.msgstore.get("msg");

            if (msg === "") return;

            if (msg === "trays-dir-empty") {
                h.logger.log("trays dir was emptied");

                h.switchPage(fadeOutLeft, "tcae.html");
            } else if (
                msg === "tray-deleted" &&
                !h.fs.existsSync(curTray.path)
            ) {
                h.logger.log("the current tray was just deleted...");
                h.logger.log("switching to tcae.html");

                h.switchPage(fadeOutLeft, "tcae.html");
            } else if (msg === "trays-dir-deleted") {
                h.logger.log("the trays dir was deleted...");

                h.switchPage(fadeOutLeft, "index.html");
            } else if (
                msg === "script-added" ||
                msg === "script-deleted" ||
                msg === "scripts-dir-deleted" ||
                msg === "scripts-dir-empty" ||
            ) {
                h.logger.log("scripts dir was changed...");
                updateScriptsDropdown();
            }

            h.stores.msgstore.set("msg", "");
        });

    // Creating the modal instance.
    var deleteConfirmationModal = document.querySelector(
        "#delete-confirmation-modal"
    );
    deleteConfirmationModalInstance = M.Modal.init(deleteConfirmationModal, {
        inDuration: 800,
        outDuration: 800,
        preventScrolling: true,
        dismissible: false,
        onCloseEnd: () => {
            $("body").css("overflow", "auto");
        }
    });

    $("#my-input-fields-form").on("change", e => {
        e.preventDefault();
        updateApplyBtnState();

        if (selectedImageTitle === "")
            $("#apply-changes-btn").prop("disabled", true);
    });

    $("#cancel-changes-btn").click(() => {
        h.switchPage(fadeOutLeft, "choices.html");
    });

    $("#apply-changes-btn")
        .prop("disabled", true)
        .click(() => {
            h.logger.log("the apply btn was clicked...");

            curTrayDataDuplicate[defaultImageTitle].title = selectedImageTitle;

            if (selectedScript.toLowerCase() !== "none")
                curTrayDataDuplicate[defaultImageTitle].script = selectedScript;
            else delete curTrayDataDuplicate[defaultImageTitle].script;

            let temp = curTrayDataDuplicate[defaultImageTitle];
            delete curTrayDataDuplicate[defaultImageTitle];

            curTrayDataDuplicate[selectedImageTitle] = temp;
            h.logger.log("the curTrayDuplicate was updated...");

            updateApplyBtnState();
            updateDataCollection();
            resetFields();

            defaultScript = null;

            curTray.set("imagesData", curTrayDataDuplicate);
        });

    $("#editing-tray-name").html(
        h.stores.state.get("currentTray") + "." + keys.traysExtension
    );

    $("#delete-confirmation-modal-no-btn").click(e => {
        e.preventDefault();
    });

    $("#delete-confirmation-modal-yes-btn").click(e => {
        e.preventDefault();

        delete curTrayDataDuplicate[defaultImageTitle];
        aTrayIsSelected = false;

        curTray.set("imagesData", curTrayDataDuplicate);

        updateApplyBtnState();
        updateDataCollection();
        resetFields();
    });

    $(".container")
        .show()
        .addClass("fadeInLeft animated");
});

function fadeOutLeft() {
    $(".container")
        .removeClass(["animated", "fadeInLeft"])
        .addClass("fadeOutLeft animated");
}
