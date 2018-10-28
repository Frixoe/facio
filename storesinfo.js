module.exports = [
    {
        name: "paths",
        cwd: "apppaths",
        defaults: {
            scriptsPath: "",
            traysPath: "",
            hasTraysPath: false,
            hasScriptsPath: false,
        }
    },
    {
        name: "scripts",
        cwd: "appscripts",
        defaults: {
            dummy: "text"
        }
    },
    {
        name: "state",
        cwd: "appstate",
        defaults: {
            currentPage: "index.html",
            prevPage: "",
            isFirstLaunch: true,
            currentTray: "",
            onePicPath: "",
            picFolderPath: "",
            prevImageInfo: "",
            hasAtLeastOneTray: false
        }
    },
    {
        name: "faceapi",
        cwd: "appfaceapi",
        defaults: {
            dummy: "text"
        }
    }
]