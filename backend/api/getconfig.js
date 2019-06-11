const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const requiredEnv = require('../requiredEnv');
const fs = require('fs');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.options('*',cors());

let config = {
    status : 'initial',
    config : {}
};

router.post('/',cors(),(req,res)=>{
    let missing = [];
    for(let field in requiredEnv) if(!process.env[field]) missing.push({field:field,desc:requiredEnv[field]});
    if(missing.length>0) {
        config.status = "missingenv"
        res.status(200);
        config.missing = missing;
        res.json(config);
        return res.end();
    }
    // Open Config File
    new Promise((resolve,reject)=>{
        fs.readFile(`${process.env.CONFIG}/app.json`, function(err,data) {
            if(err) return reject(err);
            return resolve(data);
        });
    }).then(data=>{
        // Read config file
        return new Promise((resolve,reject)=>{
            try{
                config.config = JSON.parse(data);
                return resolve(config);
            }catch(e){
                reject(e);
            }
        })
    }).then(data=>{
        config.status = (config.config.configured)?"configured":"initial";
        delete config.config.secret;
        res.status(200);
        res.json(config);
        res.end();
    }).catch(err=>{
        config.status = "error"
        config.error = `An error occured while parsing file '${process.env.CONFIG}/app.json':  ${err}`;
        res.status(500);
        res.json(config);
        res.end();
    });
});

module.exports = router;