module.exports = class {
    constructor(logger, bWinObj, winConfig, page, closingFn=null) {
        logger.log("creating a new window with page: " + page);

        this.win = new bWinObj(winConfig);
        this.win.loadURL(require("./../../pages.json")[page]);

        logger.log("loaded " + page);
        logger.log("created window");

        this.win.setMenu(null);

        this.win.on("closed", () => {
            this.win = null;
            closingFn();

            delete this;

            logger.log("closed window");
        });
    }
}