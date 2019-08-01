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
    `authUser,authPassword,dbServerNode,agentName,adapter`.split(',').map(e=>{
        if(!req.body || !req.body[e]) {
            pass = false;
            missing.push(e);
        }
    })
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
            conn.disconnect();
            console.log(`Error connecting: ${JSON.stringify(err)}`);
            res.status(500);
            res.json(err);
            res.end();
        }else{
            new Promise((resolve,reject)=>{              
                conn.exec(`CREATE ADAPTER "${req.body.adapter}" AT LOCATION AGENT ${req.body.agentName};`, null, (err, results)=>{ 
                    if (err) return reject(err);
                    resolve(results);
                });
            }).then(()=>{
                console.log(`Done creating adapter ${req.body.adapter}.`);
                res.status(200);
                res.json({
                    success : true,
                    message : `Done creating adapter ${req.body.adapter}.`
                });
                res.end();
            })
            .catch((err)=>{
                console.log(`An error occured while trying to create adapter:\n${JSON.stringify(err)}`);
                res.status(500);
                res.json(err);
                console.log(err);
                res.end();
            });
        }
    });
});

module.exports = router;