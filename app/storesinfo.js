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
            hasAtLeastOneTray: false,
            tempImagesPath: "",
            allowDataFieldPersistence: false
        }
    },
    {
        name: "fieldsstate",
        cwd: "core",
        defaults: {
            fields: []
        }
    },
    {
        name: "msgstore",
        cwd: "core"
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
