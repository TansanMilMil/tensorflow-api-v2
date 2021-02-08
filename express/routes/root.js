var express = require('express');
var router = express.Router();
const tensorFlow = require('../tensor-flow/tensor-flow');
const postgres = require('../share/postgres');
const encodeJpg = require('../share/encode-jpg');
const colorAnalysis = require('../share/color-analysis');
const getImageUrl = require('../share/get-image-url');

router.get('/onetimePass', async function(req, res, next) {
  try {
    const pass = await postgres.createOnetimePassAsync(req);
    return res.send({a: pass});
  }
  catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/localfile', async function(req, res, next) {
  try {
    if (!req.body || !req.body.pass) {
      throw({status: 400});
    }
    const hasValidPass = await postgres.getPassAsync(req);
    if (hasValidPass <= 0) {
      throw({status: 401});
    }
    
    const imageBase64 = await encodeJpg.checkOrEncode(req.body.imageBase64);

    const tensorFlowResult = await tensorFlow.executeAsync(imageBase64)
      .catch(err => {
        console.error(err);
        throw new Error(err);
      });
    
    const vibrantResult = await colorAnalysis.analysisAsync(imageBase64)
      .catch(err => {
        console.error((err));
        throw new Error(err);
      });

    return res.send({
      tensorFlowResults: tensorFlowResult,
      vibrantResult: vibrantResult,
    });
  } catch (e) {
      console.error(e);
      next(e);
  }  
});


router.post('/url', async function(req, res, next) {
  try {
    if (!req.body || !req.body.pass) {
      throw({status: 400});
    }
    const hasValidPass = await postgres.getPassAsync(req);
    if (hasValidPass <= 0) {
      throw({status: 401});
    }
    
    let imageBase64 = await getImageUrl.getImageUrlAsync(req.body.imageUrl)
      .catch(err => {
        console.error(err);
        throw new Error(err);        
      });
    console.log(imageBase64.slice(0,40));      
    imageBase64 = await encodeJpg.checkOrEncode(imageBase64);

    const tensorFlowResult = await tensorFlow.executeAsync(imageBase64)
      .catch(err => {
        console.error(err);
        throw new Error(err);
      });

    const vibrantResult = await colorAnalysis.analysisAsync(imageBase64)
      .catch(err => {
        console.error((err));
        throw new Error(err);
      });

    return res.send({
      tensorFlowResults: tensorFlowResult,
      vibrantResult: vibrantResult,      
    });
  } catch (e) {
      console.error(e);
      next(e);
  }  
});

module.exports = router;
