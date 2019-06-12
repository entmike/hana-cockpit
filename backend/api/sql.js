const express = require('express'),
router = express.Router();
const cors = require('cors');
const hana = require('@sap/hana-client');
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    var pass = true;
    var missing = [];
    `authUser,authPassword,sql`.split(',').map(e=>{
        if(!req.body || req.body[e]===undefined) {
            pass = false;
            missing.push(e);
        }
    });
    if(!pass){
        res.status(400);
        res.json({
            success : false,
            message : `The following require parameters are missing: ${missing.join(',')}`
        });
        res.end();
        return;
    }
    let conn = hana.createConnection();

    conn.connect({
        serverNode  : req.body.dbServerNode,
        uid         : req.body.authUser,
        pwd         : req.body.authPassword
    }, function(err) {
        if (err) {
            res.status(500);
            console.log(err);
            res.json(err);
        }else{
            conn.exec(req.body.sql, null, function (err, results) {
                if (err) {
                    conn.disconnect();
                    res.status(500);
                    res.json(err);
                    console.log(err);
                }else{
                    conn.disconnect();
                    res.json(results);
                }
            });
        }
    });
});

module.exports = router;