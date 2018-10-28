var helper = require("./../../helpers/getRendererModules")();

helper.logger.log("loaded 'index.html'");

$(() => {
    let hasSP = helper.stores.paths.get("hasScriptsPath");
    let hasTP = helper.stores.paths.get("hasTraysPath");

    if ((!hasSP || !hasTP) && !helper.stores.state.get("isFirstLaunch")) {
        var errT1 = M.toast({
            html: `
                <span>
                    Couldn't find Scripts and Trays paths
                </span>
                <button id="error-toast-btn1" class="btn-flat toast-action">Ok</button>
            `,
            displayLength: 8000,
            inDuration: 1000,
            outDuration: 1000,
            classes: "my-toast"
        });

        var errT2 = M.toast({
            html:`
                <span>
                    Please enter "Data Entry" mode to edit the paths
                </span>
                <button id="error-toast-btn2" class="btn-flat toast-action">Ok</button>
            `,
            displayLength: 8000,
            inDuration: 1000,
            outDuration: 1000,
            classes: "my-toast"
        });

        $("#error-toast-btn1").click(() => {
            errT1.dismiss();
        });

        $("#error-toast-btn2").click(() => {
            errT2.dismiss();
        })
    }

    helper.logger.log("hasSP: " + hasSP);
    helper.logger.log("hasTP: " + hasTP);
    helper.logger.log("hasTLOT: " + helper.stores.state.get("hasAtLeastOneTray"));
    
    if (!hasTP || !helper.stores.state.get("hasAtLeastOneTray")) $(".left").prop("disabled", true);

    // Shorten the distance between the buttons and the heading.
    $("#heading").attr("style", "height: 40px;");

    // Adding same classes to buttons.
    addClassesToButtons();

    $("body").attr("style", "overflow: hidden;");

    $(".right").click(() => {
        // Load the data collection mode file.
        if (hasSP && hasTP) helper.switchPage(helper, exitAnim1, "tcae.html");
        else helper.switchPage(helper, exitAnim3, "add_paths.html");
        M.Toast.dismissAll();
    });

    $(".left").click(() => {
        // Load the field mode file.
        helper.switchPage(helper, exitAnim2, "field.html");
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

function addClassesToButtons() {
    $(".right, .left")
    .addClass("btn hoverable teal waves-effect waves-light my-btn")
    .attr("style", "width: 200px;");
}