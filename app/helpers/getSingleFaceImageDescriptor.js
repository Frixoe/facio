module.exports = async (faceapi, document, imgPath) => {
    let imgElement = document.createElement("img");
    imgElement.src = imgPath;

    let MODELS = "./../models";

    await faceapi.loadSsdMobilenetv1Model(MODELS);
    await faceapi.loadTinyFaceDetectorModel(MODELS);
    await faceapi.loadMtcnnModel(MODELS);
    await faceapi.loadFaceLandmarkModel(MODELS);
    await faceapi.loadFaceLandmarkTinyModel(MODELS);
    await faceapi.loadFaceRecognitionModel(MODELS);

    console.log("a descriptor has been extracted for path: " + imgPath);

    return await faceapi.detectSingleFace(imgElement).withFaceLandmarks().withFaceDescriptor();
};
