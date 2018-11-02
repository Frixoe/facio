const h = require("./../../../helpers/getRendererModules")(
    false,
    false,
    ["logger", "fs", "stores", "switchPage"]
);
const isValid = require("./../../../helpers/isVaildName");
const trayAlreadyExists = require("./../../../helpers/trayAlreadyExists");
const getAllTrays = require("./../../../helpers/getAllTrays");
const Store = require("electron-store");
const path = require("path");

function getPickBtnString(tray) {
    return `Pick a tray: "${tray.replace(".ftray", "")}" Selected`;
}

function getTrayDropdownHtml(tray) {
    return `<li id="${"my-tray-" + tray.replace(".ftray", "")}"><a href="#">${tray}</a></li>`;
}

var delModal;

$(() => {
    if (h.stores.state.get("hasAtLeastOneTray")) $("#pick-a-tray-btn").prop("disabled", false);
    
    let ddContainer = document.getElementById("dropdown-container");
    let dropdownT = document.querySelector(".dropdown-trigger");
    let dropdownInstance;

    function updateDropdown() {
        if (h.stores.state.get("currentTray") === "") $("#pick-a-tray-btn").html(getPickBtnString("None.ftray"));

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

        $("#trays-dropdown").children("li").click((e) => {
            h.logger.log(e.target.innerHTML);
        
            $("#pick-a-tray-btn").html(getPickBtnString(e.target.innerHTML));
        
            h.stores.state.set("currentTray", e.target.innerHTML.replace(".ftray", ""));
            $("#delete-tray-btn").prop("disabled", false);
            $("#edit-tray-btn").prop("disabled", false);
        });
    }
    updateDropdown();

    $("#edit-tray-btn").click(() => {
        
    });

    $("#delete-tray-btn").click(e => {
        if (!h.stores.haspaths.get("hasTraysPath")) require("./../../../helpers/makePathsErrorToasts");
        else {
            // TODO: Ask if user actually wants to delete.

            let currentTray = h.stores.state.get("currentTray") + ".ftray";
            let pathToUnlink = path.join(h.stores.paths.get("traysPath"), currentTray);

            h.logger.log("deleting " + currentTray + "...");

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

            h.stores.state.set("currentState", "");

            $("#my-tray-" + currentTray.replace(".ftray", "")).remove();
            $("#pick-a-tray-btn").html(getPickBtnString("None.ftray"));
            
            $("#delete-tray-btn").prop("disabled", true);
            $("#edit-tray-btn").prop("disabled", true);

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
                delT.disiss();
            });
        }
    });

    $(".add-tray-btn-div").attr({
        style: "margin-top: 20px;"
    });

    $("#add-tray-btn").click(e => {
        e.preventDefault();

        let entry = $("#create-new-tray-input").val();

        h.logger.log("tray name entered: " +  entry);

        if (!entry) {
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
            return;
        }

        if (!isValid(entry)) {
            let t1 = M.toast({
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

            let t2 = M.toast({
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
            return;
        }

        if (!h.stores.haspaths.get("hasTraysPath")) {
            require("./../../../helpers/makePathsErrorToasts");
            return;
        }
        
        if (trayAlreadyExists(h, entry)) {
            let t3 = M.toast({
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
            return;
        }
        
        let sucT = M.toast({
            html: `<span>
            Success, "${entry}" has been added to the trays directory!
            </span>
            <button class="success-toast-btns btn-flat toast-action">Got it</button>
            `,
            displayLength: 6000,
            inDuration: 1000,
            outDuration: 1000,
            classes: "my-toast"
        });

        $(".success-toasts-btns").click(() => {
            sucT.dismiss();
        });

        let newTray = new Store({
            name: entry,
            cwd: h.stores.paths.get("traysPath"),
            fileExtension: "ftray"
        });
        newTray.clear();
        newTray.set("title", entry);

        $("#trays-dropdown").html("");
        $("#create-new-tray-input").val("");

        M.updateTextFields();
        updateDropdown();
    });
});

function removeClassForAnim() {
    return $(".container").removeClass(["animated", "fadeInLeft"]);
}

function fadeOutRight() {
    removeClassForAnim().addClass("fadeOutRight animated");
}

function fadeOutDown() {
    removeClassForAnim().addClass("fadeOutDown animated");
}

function fadeOutLeft() {
    removeClassForAnim().addClass("fadeOutLeft animated");
}