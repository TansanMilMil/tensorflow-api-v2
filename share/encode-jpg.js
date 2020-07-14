const Jimp = require('jimp');
const base64 = require('node-base64-image');


exports.encodeJpgAsync = function(png) {
    return new Promise((resolve, reject) => {
        Jimp.read(Buffer.from(png.replace(/^data:image\/png;base64,/, ""), 'base64'), function (err, pngFile) {
            if (err) {
              console.log(err);
              reject(err);
            }
            //let jpgFile = pngFile.write('final_img.jpg');
            pngFile.getBase64(Jimp.MIME_JPEG, (err, jpgBase64) => {
                if (err) {
                  console.log(err);
                  reject(err);
                }
                resolve(jpgBase64.replace(/^data:image\/jpeg;base64,/, ""));
            });
        });
    });
};
