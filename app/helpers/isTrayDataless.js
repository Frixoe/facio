module.exports = (h, curTrayStore, keys) => {
    let isImagesDataLen0 = null;
    try {
        isImagesDataLen0 = Object.keys(curTray.get("imagesData")).length === 0;
    } catch (err) {
        isImagesDataLen0 = true;
    }
    return !curTrayStore.get("imagesData") || isImagesDataLen0;
};
