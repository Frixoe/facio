window.$ = window.jQuery = require("jquery");
M.AutoInit();

$(".my-white-btn")
.addClass("btn center-align my-btn hoverable white waves-effect waves-dark")
.attr({
    style: "color: black; width: 100%;"
});

$(".my-normal-btn")
.addClass("btn hoverable teal waves-effect waves-light my-btn")
.attr({
    style: "width: 100%;"
})