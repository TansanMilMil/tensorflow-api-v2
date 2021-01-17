const request = require('request').defaults({ encoding: null });

exports.getImageUrlAsync = function(url) {
    return new Promise((resolve, reject) => {
        console.log(url);
        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const imageBase64 = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                resolve(imageBase64);
            } else {
                reject(error);
            }
        });                
    });
};
