module.exports = [
    {
        name: "paths",
        cwd: "apppaths",
        defaults: {
            scriptsPath: "",
            traysPath: ""
        }
    },
    {
        name: "haspaths",
        cwd: "apphaspaths",
        defaults: {
            hasTraysPath: false,
            hasScriptsPath: false
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
        name: "pathchangestore",
        cwd: "apppcs",
        defaults: {
            title: "This acts as an event emitter for renderer modules."
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