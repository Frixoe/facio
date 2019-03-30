const keys = require("./../../keys");
const Store = require("electron-store");
const h = require("./../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "switchPage",
    "fs"
]);
const isTrayDataless = require("./../../helpers/isTrayDataless");
const getAllTrays = require("./../../helpers/getAllTrays");

let isTraySelected = false;
let nextPages = ["start.html"];

function updateStartBtnState() {
    if (isTraySelected) $("#start-btn").prop("disabled", false);
    else $("#start-btn").prop("disabled", true);
}

function selectTray(e) {
    h.logger.log(e);

    isTraySelected = true;

    // "Deactivate" any present selected items.
    $(".collection-item").removeClass("active");
    $(".collection-items-btns").css("color", "black");

    // "Activate" the current item.
    e.currentTarget.parentElement.classList.add("active");
    $(e.currentTarget).css("color", "white");

    h.stores.state.set(
        "currentTray",
        $(e.currentTarget.parentElement)
            .find(".collection-items-tray-title")
            .html()
            .trim()
    );
    h.logger.log(h.stores.state.get("currentTray"));
    updateStartBtnState();
}

function updateCollection() {
    $("#collection-items")
        .children()
        .remove();

    let allTrays = getAllTrays(h);

    // Should never be the case. But just for safety.
    if (!allTrays)
        $("#collection-items").append(
            `
            <li class="collection-item center-align" id="collection-none-item">
                <span class="collection-items-tray-title">
                    NONE
                </span>
            </li>
            `
        );

    allTrays.forEach((tray, ind, arr) => {
        $("#collection-items").append(
            `
                <li class="collection-item truncate valign-wrapper">
                    <span class="collection-items-tray-title">
                        ${tray}
                    </span>
                    <button style="width: 100px; margin-top: 0px; margin-right: -16px; border-radius: 20px; font-family: 'montserratSemiBold';" class="btn-flat right collection-items-btns hoverable">
                        SELECT
                    </button>
                </li>
            `
        );
    });

    $(".collection-items-btns").click(e => selectTray(e));
    updateStartBtnState();
}

$(() => {
    $("body").css("overflow-y", "auto");
    $("#back-btn").click(() => h.switchPage(fadeOutRight, "index.html"));
    $("#start-btn").click(() => h.switchPage(fadeOutLeft, "start.html"));

    updateCollection();

    if (nextPages.indexOf(h.stores.state.get("prevPage")) !== -1)
        $(".container")
            .show()
            .addClass("fadeInLeft animated");
    else
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
