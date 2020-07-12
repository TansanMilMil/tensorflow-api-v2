var express = require('express');
var router = express.Router();
const tensorFlow = require('../tensor-flow/tensor-flow');
const postgres = require('../share/postgres');

router.get('/', async function(req, res, next) {
  try {
    const pass = await postgres.createOnetimePassAsync(req);
    return res.send({a: pass});
  }
  catch (e) {
    console.log(e);
    next(e);
  }
});

router.post('/', async function(req, res, next) {
  try {
    if (!req.body || !req.body.pass) {
      throw({status: 400});
    }
    const hasValidPass = await postgres.getPassAsync(req);
    console.log(`hasValidPass: ${JSON.stringify(hasValidPass)}`);
    if (hasValidPass <= 0) {
      throw({status: 401});
    }
    const result = await tensorFlow.executeAsync(req.body.imageBase64);

    return res.send({results: result});
  } catch (e) {
      console.log(e);
      next(e);
  }  
});

module.exports = router;
