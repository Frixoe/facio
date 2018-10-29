let errT1 = M.toast({
    html: `
        <span>
            ${
                !h.stores.paths.get("hasScriptsPath") && !h.stores.paths.get("hasTraysPath") ? "Couldn't find neither Scripts nor Trays paths" :
                    !h.stores.paths.get("hasTraysPath") ? "Couldn't find Trays path" : "Couldn't find Scripts path"
            }
        </span>
        <button id="paths-error-toast-btn1" class="btn-flat toast-action">Ok</button>
    `,
    displayLength: 8000,
    inDuration: 1000,
    outDuration: 1000,
    classes: "my-toast"
});

let errT2 = M.toast({
    html:`
        <span>
            ${h.stores.state.get("currentPage") === "index.html" ? 'Please enter "Data Entry" mode to edit the path(s)' : "Please edit the path(s) and try again"}
        </span>
        <button id="paths-error-toast-btn2" class="btn-flat toast-action">Ok</button>
    `,
    displayLength: 8000,
    inDuration: 1000,
    outDuration: 1000,
    classes: "my-toast"
});

$("#paths-error-toast-btn1").click(() => {
    errT1.dismiss();
});

$("#paths-error-toast-btn2").click(() => {
    errT2.dismiss();
})