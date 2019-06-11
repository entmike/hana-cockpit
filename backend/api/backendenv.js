const express = require('express');
const router = express.Router();
const cors = require('cors');
const hana = require('@sap/hana-client');
const bodyParser = require('body-parser');

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
    })
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
        res.status(200);
        res.json(process.env);
        res.end();
    }
});

module.exports = router;