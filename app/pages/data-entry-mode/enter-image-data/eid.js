const path = require("path");
const os = require("os");

const h = require("./../../../helpers/getRendererModules")(false, false, [
  "logger",
  "stores",
  "fs"
]);

let numVisible = 10;
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

  let tempPath = path.join(os.tmpdir(), "facio");
  let ind = 1;

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
      h.logger.log("moved");
    }
  });

  let instance = M.Carousel.getInstance(document.getElementById("my-carousel"));
  instance.set(0);
}

$(() => {
  updateCarousel();

  $(".container")
    .show()
    .addClass("fadeInDown animated");
});
