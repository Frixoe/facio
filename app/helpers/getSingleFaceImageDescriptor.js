module.exports = async (faceapi, document, imgPath, modelsDir) => {
    h.logger.log("img path fo descriptor: " + imgPath);

    const imgSize = require("./getImageSize")(imgPath);

    let imgElement = document.createElement("img");
    imgElement.src = imgPath;
    imgElement.width = imgSize.width;
    imgElement.height = imgSize.height;

    let MODELS = modelsDir;

    await faceapi.loadSsdMobilenetv1Model(MODELS);
    // await faceapi.loadTinyFaceDetectorModel(MODELS);
    // await faceapi.loadMtcnnModel(MODELS);
    // await faceapi.loadFaceLandmarkModel(MODELS);
    await faceapi.loadFaceLandmarkTinyModel(MODELS);
    await faceapi.loadFaceRecognitionModel(MODELS);

    console.log("a descriptor has been extracted for path: " + imgPath);

    let useTinyModel = true;
    return await faceapi
        .detectSingleFace(imgElement, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks(useTinyModel)
        .withFaceDescriptor();
    // return await faceapi.computeFaceDescriptor(imgElement);
};
