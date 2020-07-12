//const tf = require('@tensorflow/tfjs')
const mobilenet = require('@tensorflow-models/mobilenet');
const tf = require('@tensorflow/tfjs-node');
//const fs = require('fs');
const jpeg = require('jpeg-js');
const NUMBER_OF_CHANNELS = 3;

const readImage = imageBuffer => {
  //const buf = fs.readFileSync(path)
  console.log('decode imageBeffer');
  const pixels = jpeg.decode(imageBuffer, true);
  console.log('decoded imageBeffer');
  return pixels;
}

const toByteArray = jpegFile => {
  const pixels = jpegFile.data;
  const numPixels = jpegFile.width * jpegFile.height;
  const int32Array = new Int32Array(numPixels * NUMBER_OF_CHANNELS);

  for (let i = 0; i < numPixels; i++) {
    for (let channel = 0; channel < NUMBER_OF_CHANNELS; ++channel) {
      int32Array[i * NUMBER_OF_CHANNELS + channel] = pixels[i * 4 + channel];
    }
  }

  return int32Array;
}

const toTensor3d = (jpegFile) => {
  const byteArray = toByteArray(jpegFile);
  const outShape = [jpegFile.height, jpegFile.width, NUMBER_OF_CHANNELS];
  const tensor3d = tf.tensor3d(byteArray, outShape, 'int32');
  return tensor3d;
}

// const loadModel = async path => {
//   const mn = new mobilenet.MobileNet(1, 1);
//   mn.path = `file://${path}`
//   await mn.load()
//   return mn
// }

const classify = async (imageBuffer) => {
  const jpegFile = readImage(imageBuffer);
  console.log('converted jpeg');
  const tensor3d = toTensor3d(jpegFile);
  console.log('converted tensor3d');

  console.log(`mobilenet: ${mobilenet}`);
  const mobilenetModel = await mobilenet.load();
  console.log('loaded model');
  const predictions = await mobilenetModel.classify(tensor3d);

  console.log('classification results:', predictions);
  return predictions;
}

exports.executeAsync = async function (imageBuffer) {
  try {
    console.log('call classify');
    return await classify(imageBuffer);
  }
  catch(e) {
    throw e;
  }
}