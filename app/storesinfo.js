module.exports = [
  {
    name: "paths",
    cwd: "core",
    defaults: {
      scriptsPath: "",
      traysPath: ""
    },
    fileExtension: "fconfig"
  },
  {
    name: "haspaths",
    cwd: "core",
    defaults: {
      hasTraysPath: false,
      hasScriptsPath: false
    },
    fileExtension: "fconfig"
  },
  {
    name: "scripts",
    cwd: "core",
    defaults: {
      dummy: "text"
    },
    fileExtension: "fconfig"
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
    },
    fileExtension: "fconfig"
  },
  {
    name: "msgstore",
    cwd: "core",
    defaults: {
      title: "This acts as an event emitter for all modules watching it."
    },
    fileExtension: "fconfig"
  },
  {
    name: "tempimgs",
    cwd: "core",
    defaults: {
      imgs: []
    },
    fileExtension: "fconfig"
  },
  {
    name: "faceapi",
    cwd: "core",
    defaults: {
      dummy: "text"
    },
    fileExtension: "fconfig"
  }
];
