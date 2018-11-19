module.exports = [
    {
        name: "paths",
        cwd: "core",
        defaults: {
            scriptsPath: "",
            traysPath: ""
        }
    },
    {
        name: "haspaths",
        cwd: "core",
        defaults: {
            hasTraysPath: false,
            hasScriptsPath: false
        }
    },
    {
        name: "scripts",
        cwd: "core",
        defaults: {
            dummy: "text"
        }
    },
    {
        name: "state",
        cwd: "core",
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
        name: "msgstore",
        cwd: "core",
        defaults: {
            title: "This acts as an event emitter to anyone watching it."
        }
    },
    {
        name: "tempimgs",
        cwd: "core",
        defaults: {
            imgs: []
        }
    },
    {
        name: "faceapi",
        cwd: "core",
        defaults: {
            dummy: "text"
        }
    }
];
