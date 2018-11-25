const Store = require("electron-store");

const keys = require("./../../../../keys");
const getAllScripts = require("./../../../../helpers/getAllScripts");
// const isValidName = require("./../../../../helpers/isValidName");
const h = require("./../../../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "switchPage"
]);

let curTray = new Store({
    name: h.stores.state.get("currentTray"),
    cwd: h.stores.paths.get("traysPath"),
    fileExtension: keys.traysExtension
});

h.logger.log(curTray);

let scriptsDropdownInstance = null;
let curTrayDataDuplicate = curTray.get("imagesData");
let selectedImageTitle = null;
let selectedScript = null;
let defaultImageTitle = null;
let defaultScript = null;
let aTrayIsSelected = false;

function updateScriptsDropdown() {
    $("#scripts-dropdown").html("").append(
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
        )
    });
    
    // Initialize the dropdown.
    var dropdown = document.querySelector('.dropdown-trigger');
    scriptsDropdownInstance = M.Dropdown.init(dropdown, {
        constrainWidth: true,
        coverTrigger: true
    });

    scriptsDropdownInstance.isScrollable = true;
    scriptsDropdownInstance.focusIndex = 0;

    $(".my-scripts-dropdown-elements").click(e => {
        h.logger.log("cilcked on li element with innerHTML: " + e.target.innerHTML);
        let scriptVal = e.target.innerHTML.trim();

        if (!aTrayIsSelected) return;

        $("#scripts-input-field").val(scriptVal);
        selectedScript = scriptVal;

        updateApplyBtnState();
    });
}

function updateDataCollection() {
    h.logger.log("updating data collection");

    $("#collection-items").children().remove();

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
                <li class="collection-item truncate">
                    <span class="collection-items-img-title">
                        ${imgTitle}
                    </span>
                    <button style="width: 100px; margin-top: -8px; margin-right: -16px; border-radius: 20px; font-family: 'montserratSemiBold';" class="btn-flat right collection-items-btns hoverable">
                        DELETE
                    </button>
                </li>
            `
        )
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
        $(e.currentTarget).find(".collection-items-btns").css("color", "white");

        let imgTitle = $(e.currentTarget).children().first().html().trim();
        defaultImageTitle = imgTitle;
        defaultScript = curTrayDataDuplicate[imgTitle].script;

        if (!defaultScript) defaultScript = "";

        selectedImageTitle = defaultImageTitle;
        selectedScript = defaultScript;
        h.logger.log(imgTitle);
        
        if (btnPressed) {
            h.logger.log("pressed btn");
            delete curTrayDataDuplicate[imgTitle];

            aTrayIsSelected = false;

            updateDataCollection();
            resetFields();

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

    if (imgTitleChanged || imgScriptChanged && aTrayIsSelected) {
        $("#apply-changes-btn").prop("disabled", false);
    } else $("#apply-changes-btn").prop("disabled", true);
}

function resetFields() {
    $("input").val("");
}

$(() => {
    updateScriptsDropdown();

    updateDataCollection();

    $("#my-input-fields-form").on("change", e => {
        e.preventDefault();
        updateApplyBtnState();

        // TODO: Check if the new title is valid.
        if (selectedImageTitle === "") $("#apply-changes-btn").prop("disabled", true);
    });

    $("#cancel-changes-btn").click(() => {
        h.switchPage(fadeOutLeft, "choices.html");
    });

    $("#apply-changes-btn").prop("disabled", true).click(() => {
        h.logger.log("the apply btn was clicked...");

        curTrayDataDuplicate[defaultImageTitle].title = selectedImageTitle;
        
        if (selectedScript.toLowerCase() !== "none") curTrayDataDuplicate[defaultImageTitle].script = selectedScript;
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

    $("#editing-tray-name").html(h.stores.state.get("currentTray") + "." + keys.traysExtension);
    $(".container").show().addClass("fadeInLeft animated");
});

function fadeOutLeft() {
    $(".container").removeClass(["animated", "fadeInLeft"]).addClass("fadeOutLeft animated");
}
