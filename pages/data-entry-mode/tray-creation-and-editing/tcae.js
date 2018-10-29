var h = require("./../../../helpers/getRendererModules")();
var isValid = require("./../../../helpers/isVaildName");
var trayAlreadyExists = require("./../../../helpers/trayAlreadyExists");
var getAllTrays = require("./../../../helpers/getAllTrays");
var Store = require("electron-store");

$(() => {
    var ddContainer = document.getElementById("dropdown-container");
    var dropdownT = document.querySelector(".dropdown-trigger");
    var dropdownInstance;

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
        
            $("#pick-a-tray-btn").html(`Pick a tray: "${e.target.innerHTML}" Selected`);
        
            h.stores.state.set("currentTray", e.target.innerHTML.replace(".ftray", ""));
        });
    }
    updateDropdown();

    $(".add-tray-btn-div").attr({
        style: "margin-top: 20px;"
    });

    $("#add-tray-btn").attr({
        style: "color: black; width: 200px;"
    }).click(e => {
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
            return;
        }

        h.logger.log("performing checks now...");
        // Performing checks to see if paths still exist.
        require("./../../../../helpers/performChecks")(h);

        // TODO: Check if the entered tray already exists or not.
        // If does, do not add.

        if (!h.stores.paths.get("hasTraysPath")) {
            require("./../../../helpers/makePathsErrorToasts");
            return;
        }
        
        if (trayAlreadyExists(h, entry)) {
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
            return;
        }
        
        var sucT = M.toast({
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

        var newTray = new Store({
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