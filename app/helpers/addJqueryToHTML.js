window.$ = window.jQuery = require("jquery");
M.AutoInit();

$("body").attr("style", "overflow: hidden;");

$(".my-white-btn")
.addClass("btn center-align my-btn hoverable white waves-effect waves-dark")
.attr({
    style: "color: black; width: 100%;"
});

$(".my-normal-btn")
.addClass("btn hoverable teal waves-effect waves-light my-btn")
.attr({
    style: "width: 100%;"
});

$(".my-black-btn")
.addClass("btn my-btn center-align hoverable black waves-effect waves-light")
.attr({
    style: `
    color: white;
    width: 100%;
    `
});