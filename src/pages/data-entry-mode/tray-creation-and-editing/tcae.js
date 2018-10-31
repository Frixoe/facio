const h = require("./../../../helpers/getRendererModules")(
    false,
    false,
    ["logger", "fs", "stores"]
);
const isValid = require("./../../../helpers/isVaildName");
const trayAlreadyExists = require("./../../../helpers/trayAlreadyExists");
const getAllTrays = require("./../../../helpers/getAllTrays");
const Store = require("electron-store");

$(() => {
    let ddContainer = document.getElementById("dropdown-container");
    let dropdownT = document.querySelector(".dropdown-trigger");
    let dropdownInstance;

    function updateDropdown() {
        getAllTrays(h).forEach(tray => {
            $("#trays-dropdown").append(`
                <li><a href="#">${tray}</a></li>
            `);
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
        
            $("#pick-a-tray-btn").html(`Pick a tray: "${e.target.innerHTML.replace(".ftray", "")}" Selected`);
        
            h.stores.state.set("currentTray", e.target.innerHTML.replace(".ftray", ""));
            $("#delete-tray-btn").prop("disabled", false);
        });
    }
    updateDropdown();

    $("#delete-tray-btn").click(e => {
        // TODO: Fix this...
        h.fs.unlinkSync(h.stores.paths.get(""))
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
            <button id="success-btn-1" class="btn-flat toast-action">Got it</button>
            `,
            displayLength: 6000,
            inDuration: 1000,
            outDuration: 1000,
            classes: "my-toast"
        });

        $("#success-btn-1").click(() => {
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