const fs = require("fs");
const path = require("path");

var pages = {};

function isDir(path) {
    return fs.lstatSync(path).isDirectory();
}

function containsHtml(name) {
    return name.indexOf(".html") > -1;
}

function getAllFiles(source) {
    let dirsAndFilesNames = fs.readdirSync(source); // Contains all the names of the files and folders in the current directory.
    let dirsAndFilesAbsPath = dirsAndFilesNames.map(name => path.join(source, name)); // Absolute paths of the files.

    for (var i = 0; i < dirsAndFilesNames.length; ++i) {
        let fofName = dirsAndFilesNames[i];
        let absPath = path.join(source, fofName);

        if (containsHtml(fofName)) {
            pages[fofName] = "file://" + absPath;
        }
    }

    let nextDirs = dirsAndFilesAbsPath.filter(isDir); // Next directories to crawl.

    console.log("crawled " + source);
    nextDirs.forEach(nextSource => getAllFiles(nextSource));
}

getAllFiles(__dirname + "\\pages");

fs.writeFileSync("pages.json", JSON.stringify(pages, null, 4));