const h = require("./../../helpers/getRendererModules")(false, false, [
    "logger",
    "remote"
]);

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
