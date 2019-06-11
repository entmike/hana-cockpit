const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    var pass = true;
    var missing = [];
    `backendPassword`.split(',').map(e=>{
        if(!req.body || !req.body[e]) {
            pass = false;
            missing.push(e);
        }
    });
    if(!pass){
        res.status(400);
        res.json({
            success : false,
            message : `The following required parameters are missing: ${missing.join(',')}`
        });
        res.end();
        return;
    }else if(req.body.backendPassword != process.env.BACKEND_PASSWORD){
        res.status(401);
        res.json({
            success : false,
            message : `Invalid Password provided.`
        });
        res.end();
        return;
    }else{
        fs.readFile(`${process.env.CONFIG}/app.json`, function(err,data) {
            if(err) {
                res.status(500);
                res.json(`An error occured while reading configurating file ${process.env.CONFIG}/app.json}:${err}`);
                res.end();
                return console.log(err);
            }
            let config = {};
            try{
                config = JSON.parse(data);
            }catch(e){
                res.status(500);
                res.json(`An error occured while reading configurating file ${process.env.CONFIG}/app.json}:  ${e.message}`);
                res.end();
                return console.log(e);
            }
            res.status(200);
            res.json({
                config : config,
                env : process.env
            });
            res.end();
        }); 
    }
});

module.exports = router;