var Vibrant = require('node-vibrant');


exports.analysisAsync = function(imageBase64) {
    return new Promise((resolve, reject) => {
        Vibrant.from(Buffer.from(imageBase64, 'base64')).getPalette()
        .then((palette) => {
            resolve(palette);
        })
        .catch(err => reject(err));
    });
};