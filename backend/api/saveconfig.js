const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const requiredEnv = require('../requiredEnv');
const fs = require('fs');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    let missing = [];
    for(let field in requiredEnv) if(!process.env[field]) missing.push({field:field,desc:requiredEnv[field]});
    if(missing.length>0) {
        config.status = "missingenv"
        res.status(400);
        res.json(config);
        return res.end();
    }
    var pass = true;
    missing = [];
    `backendPassword,config`.split(',').map(e=>{
        if(!req.body || !req.body[e]) {
            pass = false;
            missing.push(e);
        }
    });
    if(!pass){
        res.status(400);
        res.json(`The following required parameters are missing: ${missing.join(',')}`);
        res.end();
        return;
    }else if(req.body.backendPassword != process.env.BACKEND_PASSWORD){
        res.status(401);
        res.json(`Invalid Password provided.`);
        res.end();
        return;
    }else{
        console.log(req.body.config);
        fs.writeFile(`${process.env.CONFIG}/app.json`,JSON.stringify(req.body.config.config, null, 2),(err,data)=>{
            if(err) {
                res.status(500);
                res.json(`An error occured while writing to config file ${process.env.CONFIG}/app.json}:${err}`);
                res.end();
                return console.log(err);
            }else{
                res.status(200);
                res.json(`${process.env.CONFIG}/app.json saved successfully.`);
                res.end();
            }
        })
    }
});

module.exports = router;