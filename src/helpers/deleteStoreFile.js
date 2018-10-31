module.exports = (store) => {
    const fs = require("fs");

    try {
        fs.unlinkSync(store.path);
    } catch (err) {
        helper.logger.error("Store could not be deleted!");
    }
}