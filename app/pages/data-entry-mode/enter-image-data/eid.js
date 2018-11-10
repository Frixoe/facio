const h = require("./../../../helpers/getRendererModules")(false, false, [
    "logger",
    "stores",
    "fs"
]);

function updateCarousel() {
    $(".carousel").html("");

    h.fs.readdirSync(h.stores.tempimgs.path).forEach(src => {
        $(".carousel").append(`
            <a class="carousel-item"><img src="${src}"></a>
        `)
    });
}

$(() => {
    // var elems = document.querySelectorAll('.carousel');
    // var instances = M.Carousel.init(elems, {
    //     duration: 1000,
    //     indicators: true,
    //     onCycleTo: (val) => {
    //         h.logger.log("recieved this val: ");
    //         h.logger.log(val);
    //     }
    // });
    // $(".carousel").carousel();

    updateCarousel();

    $(".container").addClass("fadeInDown animated");
});