window.$ = window.jQuery = require("jquery");

M.AutoInit();

const utilForJq = require("electron-util");

$(".my-titlebar").addClass("z-depth-2");

$(".my-titlebar-btn")
.addClass("btn-flat right center-align waves-effect waves-light");

$("#my-titlebar-close-btn")
.css("border-top-right-radius", "20px")
.click(() => utilForJq.activeWindow().close());

$("#my-titlebar-minimize-btn")
.click(() => utilForJq.activeWindow().minimize());

$(".my-white-btn")
.addClass("btn center-align my-btn hoverable white waves-effect waves-dark");

$(".my-normal-btn")
.addClass("btn hoverable teal waves-effect waves-light my-btn");

$(".my-black-btn")
.addClass("btn my-btn center-align hoverable black waves-effect waves-light");