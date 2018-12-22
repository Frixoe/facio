const path = require("path");
const os = require("os");
const chokidar = require("chokidar");
const qs = require("querystring");
const Store = require("electron-store");

const keys = require("./../../../keys");
const isValidName = require("./../../../helpers/isVaildName");
const getSingleFaceImageDescriptor = require("./../../../helpers/getSingleFaceImageDescriptor");
const getAllFacesImageDescriptors = require("./../../../helpers/getAllFacesImageDescriptor");
const getAllScripts = require("./../../../helpers/getAllScripts");
const h = require("./../../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "remote",
    "fs"
]);

let allowDataFieldPersistence = h.stores.state.get("allowDataFieldPersistence");
let scriptsDropdownInstance; // The instance of the scripts dropdown.
let selectedScript = "none"; // The selected script.
let userWantsToSave = false; // Boolean indicating whether the user wants to save the image info.
let isTitleUnique = true; // Boolean indication whether the image title entered is unique.
let lastImg = false; // Boolean which tells if the there is only one image left.
let curImg = null; // The image selected by the carousel.
let curImageInfo = {}; // The object which stores the current image's information. This gets reset evertime the user changes the image.
let numVisible = 10; // Keep 10 at max for convenience.
let tempPath = h.stores.state.get("tempImagesPath");
let numToWords = [
    "#one!",
    "#two!",
    "#three!",
    "#four!",
    "#five!",
    "#six!",
    "#seven!",
    "#eight!",
    "#nine!",
    "#ten!"
];
let progressBar = 
`
<div class="container" id="my-progress-bar" style="background-color: rgba(255, 255, 255, 0.7); position: absolute; z-index: 3; height: 100vh; width: 100%;" hidden>
    <div id="my-progress-bar-attrs" style="width: 50%; margin-left: 25%; margin-top: 30%;">
        <!-- this is where the proggress bar goes -->
        <div class="progress">
            <div class="indeterminate"></div>
        </div>
    </div>
</div>
`

/*
    TODO: Add a loading screen right after the user clicks "Add Image."
    TODO: Add ability to press enter and save the image info when modal is shown.
    TODO: Do not let the user add the image if the image descriptor already exists or the distance to other descriptors is very small.
    TODO: Do not let the user add the image if it doesn't contain a face.
    TODO: Do not let the user add the image if it contains more than one face.
    TODO: Edit each image in the carousel by creating a rectangle around the face contained in the image.
*/

// Getting the current tray as a Store obj.
let curTray = new Store({
    name: h.stores.state.get("currentTray"),
    cwd: h.stores.paths.get("traysPath"),
    fileExtension: keys.traysExtension
});

// Monkey patching face-api.js
faceapi.env.monkeyPatch({
    Canvas: HTMLCanvasElement,
    Image: HTMLImageElement,
    ImageData: ImageData,
    Video: HTMLVideoElement,
    createCanvasElement: () => document.createElement('canvas'),
    createImageElement: () => document.createElement('img')
});

h.logger.log("faceapi: ");
h.logger.log(faceapi);

function updateLastImg() {
    if ($("#my-carousel").children().length === 1) lastImg = true;
}

function updateCarousel() {
    $(".carousel").html("");

    let ind = 1; // Starting index of every carousel image.

    h.fs.readdirSync(tempPath).forEach(src => {
        if (keys.supportedImgExtensions.indexOf(path.extname(src).replace(".", "")) === -1) return;

        ind++;
        if (ind > numVisible + 1) return;

        let imgPath = path.join(tempPath, src);

        $(".carousel").append(`
            <a class="carousel-item" style="width: 400px; height: 200px;" href="${
                numToWords[ind - 1]
            }"><img src="${imgPath}"></a>
        `);
    });

    if ($(".carousel").html() === "") {
        h.stores.msgstore.set("msg", "folder-supported-imgs-not-found");
        h.remote.getCurrentWindow().close();
    }

    var carousel = document.querySelectorAll(".carousel");
    var instances = M.Carousel.init(carousel, {
        duration: 200,
        shift: 0,
        padding: -100,
        dist: 0,
        indicators: true,
        numVisible: numVisible,
        onCycleTo: (val, grabbed) => {
            resetFields();

            h.logger.log("moved");
            h.logger.log(val);
            h.logger.log(grabbed);

            h.logger.log("clearing curImageInfo");
            curImageInfo = {};

            // Getting the img src which is the child of the a tag.
            withProtocol = $(val)
                .children()
                .get(0).src;
            h.logger.log("withProtocol path: ");
            h.logger.log(withProtocol);

            // Removing the protocol from the image src.
            let withoutProtocol = withProtocol.replace(
                /(^\w+:|^)\/\/\/|(^\w+:|^)\\\\\\|(^\w+:|^)\/\/|(^\w+:|^)\\\\/,
                ""
            );
            h.logger.log("withoutProtocol path: " + withoutProtocol);

            curImg = withoutProtocol;

            if (withProtocol.indexOf(withoutProtocol)) {
                h.logger.log("image path exists");
            } else
                throw Error(
                    "Could not resolve image path by using regex from the carousel function!"
                );
        }
    });

    let instance = M.Carousel.getInstance(
        document.getElementById("my-carousel")
    );
    instance.set(0);
}

function updateScriptsDropdown() {
    $("#scripts-dropdown")
        .html("")
        .append(
            `
            <li class="my-scripts-dropdown-elements" id=""><a href="#!">None</a></li>
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

        $("#scripts-input-field").val(scriptVal);
        selectedScript = scriptVal;
    });
}

function resetFields() {
    $("#add-image-to-tray-btn").prop("disabled", true);
    $("#input-elements-div")
        .children()
        .remove();

    $("input").val("");

    selectedScript = "none";
}

$(() => {
    $("body").prepend(progressBar);

    // Creating the temp dir watcher...
    let tempDirWatcher = chokidar.watch(tempPath);
    let msgstoreWatcher = chokidar.watch(h.stores.msgstore.path);

    tempDirWatcher
        .on("ready", () => h.logger.log("tempDir watcher reporting for duty!"))
        .on("add", path => {
            h.logger.log("a new img/file has been added: " + path);

            h.logger.log("updating the carousel!");
            updateCarousel();
        })
        .on("unlink", path => {
            h.logger.log("an img/file has been deleted: " + path);

            updateLastImg();

            if (lastImg) return;

            h.logger.log("updating the carousel!");
            updateCarousel();
        })
        .on("unlinkDir", path => {
            h.logger.log("the temp path was deleted: " + path);

            h.logger.log("updating the carousel!");

            h.remote.getCurrentWindow().close();
        });

    msgstoreWatcher
        .on("ready", () => h.logger.log("msgstore watcher reporting for duty!"))
        .on("all", (event, path) => {
            let msg = h.stores.msgstore.get("msg");

            if (msg === "") return;

            if (msg === "trays-dir-deleted" || msg === "trays-dir-empty") {
                h.logger.log(
                    "closing the image info window because trays dir was deleted or was emptied..."
                );
                h.remote.getCurrentWindow().close();
            } else if (msg === "tray-deleted") {
                h.logger.log("a tray was deleted...");
                h.logger.log("curTray.path" + curTray.path);
                let curTrayExists = h.fs.existsSync(curTray.path);

                h.logger.log("was the current tray deleted? " + !curTrayExists);

                if (!curTrayExists) {
                    h.logger.log("the tray being editted was deleted...");
                    h.logger.log("closing the image info window...");
                    h.remote.getCurrentWindow().close();
                }
            } else if (
                msg === "scripts-dir-deleted" ||
                msg === "scripts-dir-empty" ||
                msg === "script-added" ||
                msg === "script-deleted"
            ) {
                h.logger.log("scripts dir changed...");
                h.logger.log("updating the dropdown...");

                $("#scripts-input-field").val("");

                updateScriptsDropdown();
            }

            h.stores.msgstore.set("msg", "");
        });

    updateScriptsDropdown();

    $("#scripts-dropdown-btn").click(() => {
        scriptsDropdownInstance.open();
    });

    // Initialize the modals
    var newFieldModal = document.querySelectorAll("#new-field-modal");
    var newFieldModalInstance = M.Modal.init(newFieldModal, {
        inDuration: 800,
        outDuration: 800,
        preventScrolling: true,
        onOpenEnd: () => {
            h.logger.log("focussing on the modal input field...");
            $("#new-field-input").focus();
        },
        onCloseEnd: () => {
            $("body").css("overflow", "auto");
        }
    });

    var imageInfoModal = document.querySelector("#image-info-modal");
    var imageInfoModalInstance = M.Modal.init(imageInfoModal, {
        inDuration: 800,
        outDuration: 800,
        preventScrolling: true,
        dismissible: false,
        onCloseEnd: () => {
            $("body").css("overflow", "auto");

            if (!userWantsToSave) return;

            if (os.platform() === "linux") curImg = "/" + curImg;

            $("body").prepend(progressBar);

            curImg = qs.unescape(curImg);

            getSingleFaceImageDescriptor(faceapi, document, curImg, path.join(__dirname, "..", "..", "..", "assets", "models")).then(descriptor => {
                
                h.logger.log("got descriptor: ");
                h.logger.log(descriptor);
                
                curImageInfo.descriptor = descriptor;
                curImageInfo.title = document.getElementById(
                    "image-title-field-input"
                    ).value; // Used DOM as Jq method did not work.
                    
                    if (selectedScript.toLowerCase() !== "none")
                    curImageInfo.script = selectedScript;
                    
                    $(".image-extra-field-inputs").each((ind, el) => {
                        let key = $(el)
                        .next()
                        .html();
                        let value = el.value;
                        
                        curImageInfo[key] = value;
                    });
                    
                    h.logger.log(curImageInfo);
                    curTray.set(`imagesData.${curImageInfo.title}`, curImageInfo);
                    h.logger.log("image data saved...");
                    
                    // Remove the current image from the temp dir...
                    updateLastImg();
                    
                    let imgTitle = curImageInfo.title; // Since the curImageInfo obj will be emptied.
                    
                    try {
                        h.fs.unlinkSync(curImg);
                    } catch (err) {
                        h.logger.error(err);
                        // If err, delete the image data.
                        
                        h.logger.error(
                            "Error when deleting the image! Deleting the image data..."
                            );
                            
                            let allData = curTray.get("imagesData");
                            delete allData[curImageInfo.title];
                            
                            curTray.set("imagesData", allData);
                            
                            h.logger.log(
                                "updated the tray by removing the current image's info..."
                                );
                            }
                            
                            if (lastImg) h.remote.getCurrentWindow().close();
                            
                            resetFields();
                            
                            let infoAddedT = M.toast({
                                html: `
                                <span>Image info "${imgTitle}" added to "${h.stores.state.get(
                                    "currentTray"
                                    ) +
                                    "." +
                                    keys.traysExtension}"</span>
                                    <button id="image-info-added-toast-btn" class="btn-flat toast-action">Ok</button>
                                    `,
                                    displayLength: 5000,
                                    inDuration: 1000,
                                    outDuration: 1000,
                                    classes: "my-toast"
                                });
                                
                                $("#image-info-added-toast-btn").click(() => {
                                    infoAddedT.dismiss();
                });
                $("#my-progress-bar").remove();
            });

            userWantsToSave = false;
        }
    });

    updateCarousel();

    $("modal-field-close-btn").click(e => e.preventDefault());

    $("#image-info-modal-no-btn").click(e => e.preventDefault());

    $("#my-field-modal-form").on("submit", e => {
        e.preventDefault();

        h.logger.log("modal-add-field-btn clicked");

        let newFieldValue = $("#new-field-input").val();
        let newFieldInputDivId = "image-" + newFieldValue + "-field-div";
        let newFieldInputId = "image-" + newFieldValue + "-field-input";
        let newFieldDelBtnId = "image-" + newFieldValue + "-field-input-btn";

        let isPresent = false; // Boolean which indicates if the field already exists.
        $(".image-extra-field-inputs").each((ind, el) => {
            if (isPresent) return;

            isPresent =
                $(el)
                    .next()
                    .html() === newFieldValue
                    ? true
                    : false;
        });

        if (isPresent) {
            M.toast({
                html: `"${newFieldValue}" already exists!`,
                displayLength: 3000,
                inDuration: 1000,
                outDuration: 1000,
                classes: "my-toast"
            });

            return;
        }

        if (
            newFieldValue === "" ||
            newFieldValue.toLowerCase() === "title" ||
            !isValidName(newFieldValue) ||
            newFieldValue.toLowerCase() === "descriptor" ||
            newFieldValue.toLowerCase() === "script"
        ) {
            M.toast({
                html: "That name cannot be a field. Please use another name.",
                displayLength: 3000,
                inDuration: 1000,
                outDuration: 1000,
                classes: "my-toast"
            });
            return;
        }

        $("#new-field-input").val("");

        $("#input-elements-div").append(
            `
            <div class="row" id="${newFieldInputDivId}" hidden>
                <div class="input-field col s10">
                    <input id="${newFieldInputId}" type="text" class="validate image-extra-field-inputs" maxlength="50">
                    <label for="${newFieldInputId}">${newFieldValue}</label>
                </div>
                <div class="col s2" style="margin-top: 20px;">
                    <button type="button" id="${newFieldDelBtnId}" class="my-black-btn btn my-btn center-align hoverable black waves-effect waves-light">Del</button>
                </div>
            </div>
            `
        );

        $(`#${newFieldInputDivId}`)
            .addClass("fadeInLeft animated")
            .show();

        $(`#${newFieldDelBtnId}`).click(e => {
            e.preventDefault();

            $(`#${newFieldInputDivId}`)
                .removeClass(["fadeInLeft", "animated"])
                .addClass("fadeOutLeft animated");
            setTimeout(() => {
                $(`#${newFieldInputDivId}`).remove();
            }, 1000);

            let delFieldT = M.toast({
                html: `
                    <span>
                        Field "${newFieldValue}" was deleted!
                    </span>
                    <button id="field-del-toast-btn" class="btn-flat toast-action">Ok</button>
                `,
                displayLength: 4000,
                inDuration: 1000,
                outDuration: 1000,
                classes: "my-toast"
            });

            $("#field-del-toast-btn").click(() => {
                delFieldT.dismiss();
            });
        });

        let sucT = M.toast({
            html: `
                <span>
                    Field "${newFieldValue}" was added!
                </span>
                <button id="field-added-toast-btn" class="btn-flat toast-action">Ok</button>
            `,
            displayLength: 3000,
            inDuration: 1000,
            outDuration: 1000,
            classes: "my-toast"
        });

        $("#field-added-toast-btn").click(() => {
            sucT.dismiss();
        });

        h.logger.log(curImageInfo);
    });

    $("#my-image-info-modal-form").on("submit", e => {
        e.preventDefault();

        h.logger.log("submit from my-image-info-modal-form");

        let tempImageInfoModalInstance = M.Modal.getInstance(
            document.getElementById("image-info-modal")
        );
        tempImageInfoModalInstance.close();

        userWantsToSave = true;
    });

    $("#add-image-to-tray-btn").click(e => {
        e.preventDefault();

        h.logger.log(
            "saving the image values to tray with the following data: "
        );

        if (!isTitleUnique) {
            let uniqueTitleT = M.toast({
                html: `
                    <span>
                        That title already exists. Please enter another title.
                    </span>
                    <button id="unique-title-toast-btn" class="btn-flat toast-action">Ok</button>
                `,
                displayLength: 5000,
                inDuration: 1000,
                outDuration: 1000,
                classes: "my-toast"
            });

            $("#unique-title-toast-btn").click(() => {
                uniqueTitleT.dismiss();
            });

            return;
        }

        $("#image-title-info-modal-placeholder").html(
            document.getElementById("image-title-field-input").value
        );
        $("#tray-name-image-info-modal-placeholder").html(
            `${h.stores.state.get("currentTray") + "." + keys.traysExtension}`
        );

        imageInfoModalInstance.open();
    });

    $("#image-title-field-input").on("change", e => {
        e.preventDefault();

        h.logger.log("some input value was changed...");

        let titleVal = e.target.value;
        h.logger.log("the title val: " + titleVal);

        if (titleVal === "") $("#add-image-to-tray-btn").prop("disabled", true);
        else $("#add-image-to-tray-btn").prop("disabled", false);

        if (!$("#add-image-to-tray-btn").prop("disabled")) {
            if (curTray.get("imagesData")) {
                isTitleUnique =
                    Object.keys(curTray.get("imagesData")).indexOf(
                        $("#image-title-field-input").val()
                    ) !== -1
                        ? false
                        : true;
            } else isTitleUnique = true;
        }
    });

    $("#close-btn").click(e => {
        h.remote.BrowserWindow.getFocusedWindow().close();
    });

    resetFields();

    $(".container")
        .show()
        .addClass("fadeInLeft animated");
    
    $("#my-progress-bar").remove();
});
