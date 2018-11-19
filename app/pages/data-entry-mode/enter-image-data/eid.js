const path = require("path");
const os = require("os");
const chokidar = require("chokidar");
const Store = require("electron-store");

const keys = require("./../../../keys");
const isValidName = require("./../../../helpers/isVaildName");
const getImageDescriptor = require("./../../../helpers/getImageDescriptor");
const h = require("./../../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "remote",
    "fs"
]);

let userWantsToSave = false; // Boolean indicating whether the user wants to save the image info.
let isTitleUnique = true; // Boolean indication whether the image title entered is unique.
let lastImg = false; // Boolean which tells if the there is only one image left.
let curImg = null; // The image selected by the carousel.
let curImageInfo = {}; // The object which stores the current image's information. This gets reset evertime the user changes the image.
let numVisible = 10; // Keep 10 at max for convenience.
let tempPath = path.join(os.tmpdir(), "facio");
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

// Getting the current tray as a Store obj.
let curTray = new Store({
    name: h.stores.state.get("currentTray"),
    cwd: h.stores.paths.get("traysPath"),
    fileExtension: keys.traysExtension
});

function updateCarousel() {
    $(".carousel").html("");

    let ind = 1; // Starting index of every carousel image.

    h.fs.readdirSync(tempPath).forEach(src => {
        ind++;
        if (ind > numVisible) return;

        let imgPath = path.join(tempPath, src);

        $(".carousel").append(`
            <a class="carousel-item" style="width: 400px; height: 200px;" href="${
                numToWords[ind - 1]
            }"><img src="${imgPath}"></a>
        `);
    });

    var elems = document.querySelectorAll(".carousel");
    var instances = M.Carousel.init(elems, {
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
            withProtocol = $(val).children()[0].src;
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

function resetFields() {
    $("#add-image-to-tray-btn").prop("disabled", true);
    $("#input-elements-div")
        .children()
        .remove();
    if ($("#image-title-field-input").val())
        $("#image-title-field-input").val("");
}

$(() => {
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

            if (msg === "trays-dir-deleted") {
            }

            if (msg === "trays-dir-empty") {
            }

            if (msg === "tray-deleted") {
            }

            if (msg === "scripts-dir-deleted") {
            }

            if (msg === "scripts-dir-empty") {
            }

            h.stores.msgstore.set("msg", "");
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
        onCloseEnd: () => {
            $("body").css("overflow", "auto");

            if (!userWantsToSave) return;

            getImageDescriptor(curImg).then(descriptor => {
                curImageInfo.descriptor = descriptor;
                curImageInfo.title = document.getElementById(
                    "image-title-field-input"
                ).value; // Used DOM as Jq method did not work.

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
                if ($("#my-carousel").children().length === 1) lastImg = true;

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
            newFieldValue.toLowerCase() === "descriptor"
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

        if (isTitleUnique) {
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
            isTitleUnique =
                Object.keys(curTray.get("imagesData")).indexOf(titleVal) !== -1
                    ? true
                    : false;
        }
    });

    resetFields();

    $(".container")
        .show()
        .addClass("fadeInLeft animated");
});
