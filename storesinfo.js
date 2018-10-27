module.exports = [
    {
        name: "paths",
        cwd: "apppaths",
        defaults: {
            scriptsPath: "",
            traysPath: "",
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
            firstLaunch: true,
            currentTray: "",
            onePicPath: "",
            picFolderPath: "",
            prevImageInfo: ""
        }
    },
    {
        name: "faceapi",
        cwd: "appfaceapi"
    }
]