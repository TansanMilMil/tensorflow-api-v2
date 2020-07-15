const Jimp = require('jimp');
const base64 = require('node-base64-image');


const encodeJpgAsync = function(png) {
    return new Promise((resolve, reject) => {
        Jimp.read(Buffer.from(png.replace(/^data:image\/png;base64,/, ""), 'base64'), function (err, pngFile) {
            if (err) {
              console.log(err);
              reject(err);
            }
            
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

exports.checkOrEncode = async function(reqImageBase64) {
    let imageBase64;
    if (reqImageBase64.match(/data:image\/jpg;base64,/)) {
      imageBase64 = reqImageBase64.replace(/data:image\/jpg;base64,/, '');
      
    } else if (reqImageBase64.match(/data:image\/jpeg;base64,/)) {
      imageBase64 = reqImageBase64.replace(/data:image\/jpeg;base64,/, '');
      
    } else if (reqImageBase64.match(/data:image\/png;base64,/)) {
      console.log(`start encoding to jpeg.`);
      imageBase64 = await encodeJpgAsync(reqImageBase64)
        .catch(err => {
          console.error(err);
          throw new Error(err);
        });
      console.log(`encoding ok.`);
    }
    
    return imageBase64;
};