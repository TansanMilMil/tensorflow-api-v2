//const tf = require('@tensorflow/tfjs')
const mobilenet = require('@tensorflow-models/mobilenet');
const tf = require('@tensorflow/tfjs-node');
const jpeg = require('jpeg-js');
const NUMBER_OF_CHANNELS = 3;

const readImage = image => {
  const imageBuffer = Buffer.from(image, 'base64');
  const pixels = jpeg.decode(imageBuffer, true);
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

const classify = async (image) => {
  const jpegFile = readImage(image);
  const tensor3d = toTensor3d(jpegFile);

  const mobilenetModel = await mobilenet.load();
  const predictions = await mobilenetModel.classify(tensor3d);

  return predictions;
}

exports.executeAsync = async function (image) {
  try {
    return await classify(image);
  }
  catch(e) {
    throw e;
  }
}