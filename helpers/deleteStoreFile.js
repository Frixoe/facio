module.exports = (store) => {
    var fs = require("fs");

    try {
        fs.unlinkSync(store.path);
    } catch (err) {
        helper.logger.error("Store could not be deleted!");
    }
}