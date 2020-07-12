var express = require('express');
var router = express.Router();
const tensorFlow = require('../tensor-flow/tensor-flow');
const response = require('../share/response');

router.get('/', async function(req, res, next) {
  res.render('index', { title: 'Express' });

  try {
    console.log('start express server.');
    if (req.isBase64Encoded) {
        console.log('event.isBase64Encoded: true');
        const imageBuffer = new Buffer(req.body, 'base64');
        console.log('created imageBeffer');
        const result = await tensorFlow.executeAsync(imageBuffer);
    
        res.send(response.createResponse(200, result));
    } else {
        res.send(response.createResponse(400, 'request body was not base64encoded file.'));
    }
  } catch (e) {
      console.log(e);
      res.send(response.createResponse(400, 'request body was not base64encoded file.'));
  }  
});

module.exports = router;
