var express = require('express');
var router = express.Router();
const tensorFlow = require('../tensor-flow/tensor-flow');
const response = require('../share/response');

router.post('/', async function(req, res, next) {
  try {
    console.log('start express server.');
    const result = await tensorFlow.executeAsync(req.body.imageBase64);

    return res.send({results: result});
  } catch (e) {
      console.log(e);
      next(e);
  }  
});

module.exports = router;
