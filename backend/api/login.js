const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    let missing = [];
    var pass = true;
    missing = [];
    `appPassword`.split(',').map(e=>{
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
    }else if(req.body.appPassword != process.env.BACKEND_PASSWORD){
        res.status(401);
        res.json(`Invalid Password provided.`);
        res.end();
        return;
    }else{
        res.status(200);
        res.json(`Logged in successfully.`);
        res.end();
    }
});

module.exports = router;