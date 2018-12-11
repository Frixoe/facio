module.exports = async (faceapi, document, imgPath, modelsDir) => {
    const imgSize = require("./getImageSize")(imgPath);

    let imgElement = document.createElement("img");
    imgElement.src = imgPath;
    imgElement.width = imgSize.width;
    imgElement.height = imgSize.height;

    let MODELS = modelsDir;

    await faceapi.loadSsdMobilenetv1Model(MODELS);
    await faceapi.loadTinyFaceDetectorModel(MODELS);
    await faceapi.loadMtcnnModel(MODELS);
    await faceapi.loadFaceLandmarkModel(MODELS);
    await faceapi.loadFaceLandmarkTinyModel(MODELS);
    await faceapi.loadFaceRecognitionModel(MODELS);

    return await faceapi
        .detectAllFaces(imgElement)
        .withFaceLandmarks()
        .withFaceDescriptors();
};
