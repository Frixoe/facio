const path = require("path");
const fs = require("fs");

function isDir(path) {
    return fs.lstatSync(path).isDirectory();
}

function containsHtml(name) {
    return name.indexOf(".html") > -1;
}

let pages = {};

function getAllFiles(source) {
    let dirsAndFilesNames = fs.readdirSync(source); // Contains all the names of the files and folders in the current directory.
    let dirsAndFilesAbsPath = dirsAndFilesNames.map(name =>
        path.join(source, name)
    ); // Absolute paths of the files.

    for (var i = 0; i < dirsAndFilesNames.length; ++i) {
        let fofName = dirsAndFilesNames[i];
        let absPath = path.join(source, fofName);

        if (containsHtml(fofName)) {
            pages[fofName] = require("url").format({
                pathname: absPath,
                slashes: true,
                protocol: "file"
            });
        }
    }

    let nextDirs = dirsAndFilesAbsPath.filter(isDir); // Next directories to crawl.

    console.log("crawled " + source);
    nextDirs.forEach(nextSource => getAllFiles(nextSource));
}

module.exports = appPath => {
    getAllFiles(path.join(appPath, "app", "pages"));
    return pages;
};
