module.exports = class {
    constructor(logger, pages, bWinObj, winConfig, page, closingFn = null) {
        logger.log("creating a new window with page: " + page);

        this.win = new bWinObj(winConfig);

        this.win.eval = global.eval = () => {
            throw new Error("No no no >:) can't be evalin' in these lands...");
        };
        this.win.loadURL(pages[page]);

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
};
