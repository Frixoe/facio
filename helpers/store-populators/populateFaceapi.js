module.exports = (h) => {
    h.logger.log("populating 'faceapi' now...");

    // let faceapi = require("face-api.js");

    // (async () => {
    //     const MODELS = "./../../models";

    //     await faceapi.loadFaceDetectionModel(MODELS);
    //     await faceapi.loadFaceLandmarkModel(MODELS);
    //     await faceapi.loadFaceLandmarkTinyModel(MODELS);
    //     await faceapi.loadFaceRecognitionModel(MODELS);
    //     await faceapi.loadMtcnnModel(MODELS);
    //     await faceapi.loadSsdMobilenetv1Model(MODELS);
    //     await faceapi.loadTinyYolov2Model(MODELS);

    //     h.stores.faceapi.set("faceapi", faceapi);

    //     h.logger.log("populated 'faceapi'...");
    // })();
    h.logger.log("populated 'faceapi'");
}