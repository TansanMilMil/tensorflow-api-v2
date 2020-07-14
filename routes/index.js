var express = require('express');
var router = express.Router();
const tensorFlow = require('../tensor-flow/tensor-flow');
const postgres = require('../share/postgres');
const encodeJpg = require('../share/encode-jpg');


router.get('/', async function(req, res, next) {
  try {
    const pass = await postgres.createOnetimePassAsync(req);
    return res.send({a: pass});
  }
  catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/', async function(req, res, next) {
  try {
    if (!req.body || !req.body.pass) {
      throw({status: 400});
    }
    const hasValidPass = await postgres.getPassAsync(req);
    if (hasValidPass <= 0) {
      throw({status: 401});
    }
    
    console.log(`${req.body.imageBase64.slice(0, 50)}`);      
    let imageBase64;
    if (req.body.imageBase64.match(/data:image\/jpg;base64,/)) {
      imageBase64 = req.body.imageBase64.replace(/data:image\/jpg;base64,/, '');
      
    } else if (req.body.imageBase64.match(/data:image\/jpeg;base64,/)) {
      imageBase64 = req.body.imageBase64.replace(/data:image\/jpeg;base64,/, '');
      
    } else if (req.body.imageBase64.match(/data:image\/png;base64,/)) {
      console.log(`start encoding.`);
      imageBase64 = await encodeJpg.encodeJpgAsync(req.body.imageBase64)
        .catch(err => {
          console.error(err);
          throw new Error(err);
        });
      console.log(`encoding ok.`);
    }
    console.log(`${imageBase64.slice(0, 50)}`);      

    const result = await tensorFlow.executeAsync(imageBase64)
      .catch(err => {
        console.error(err);
        throw new Error(err);
      });

    return res.send({results: result});
  } catch (e) {
      console.error(e);
      next(e);
  }  
});

module.exports = router;
