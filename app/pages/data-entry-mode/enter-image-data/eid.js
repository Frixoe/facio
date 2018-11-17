const path = require("path");
const os = require("os");
const chokidar = require("chokidar");
const isValidName = require("./../../../helpers/isVaildName");
const h = require("./../../../helpers/getRendererModules")(false, false, [
  "logger",
  "stores",
  "remote",
  "fs"
]);

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

  let instance = M.Carousel.getInstance(document.getElementById("my-carousel"));
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

  msgstore
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

  // Initialize the modal
  var elems = document.querySelectorAll(".modal");
  var instances = M.Modal.init(elems, {
    inDuration: 800,
    outDuration: 800,
    preventScrolling: true,
    onCloseEnd: () => {
      $("body").css("overflow", "auto");
    }
  });

  updateCarousel();

  $("#my-modal-form").on("submit", e => {
    e.preventDefault();

    h.logger.log("modal-add-field-btn clicked");

    let newFieldValue = $("#new-field-input").val();
    let newFieldInputDivId = "image-" + newFieldValue + "-field-div";
    let newFieldInputId = "image-" + newFieldValue + "-field-input";
    let newFieldDelBtnId = "image-" + newFieldValue + "-field-input-btn";

    if (
      newFieldValue === "" ||
      newFieldValue.toLowerCase() === "title" ||
      !isValidName(newFieldValue)
    ) {
      return;
    }

    $("#new-field-input").val("");

    $("#input-elements-div").append(`
      <div class="row" id="${newFieldInputDivId}" hidden>
        <div class="input-field col s10">
          <input id="${newFieldInputId}" type="text" class="validate image-extra-field-inputs" maxlength="50">
          <label for="${newFieldInputId}">${newFieldValue}</label>
        </div>
        <div class="col s2" style="margin-top: 20px;">
          <button id="${newFieldDelBtnId}" class="my-black-btn btn my-btn center-align hoverable black waves-effect waves-light">Del</button>
        </div>
      </div>
    `);

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
    });

    h.logger.log(curImageInfo);
  });

  $("#add-image-to-tray-btn").click(e => {
    e.preventDefault();

    h.logger.log("saving the image values to tray with the following data: ");
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

    // Remove the current image from the temp dir...
    if ($("#my-carousel").children().length === 1) lastImg = true;

    try {
      h.fs.unlinkSync(curImg);
    } catch (err) {
      h.logger.error(err);
    }

    if (lastImg) h.remote.getCurrentWindow().close();

    resetFields();
  });

  $("#input-elements-form").on("change", e => {
    e.preventDefault();

    h.logger.log("some input value was changed...");

    let titleVal = e.target.value;
    h.logger.log("the title val: " + titleVal);

    if (titleVal === "") $("#add-image-to-tray-btn").prop("disabled", true);
    else $("#add-image-to-tray-btn").prop("disabled", false);
  });

  resetFields();

  $(".container")
    .show()
    .addClass("fadeInLeft animated");
});
