var h = require("./../../helpers/getRendererModules")();

h.logger.log("loaded error page to restart the app...");

$(() => {
    $(".error-text-container").attr({
        style: "margin-top: -20px;"
    });
});

function closeApp() {
    h.logger.log("closing the app now...");
    h.remote.app.quit();
}