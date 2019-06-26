const express = require('express');
const router = express.Router();
const cors = require('cors');
const hana = require('@sap/hana-client');
const bodyParser = require('body-parser');
const os = require('os');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    var pass = true;
    var missing = [];
    `dbServerNode,authUser,authPassword,comment,certificate`.split(',').map(e=>{
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
    let cert = req.body.certificate.replace(/\n/g,'')
        .replace(/\r/g,'')
        .replace(/ /g,'')
        .replace(/-----BEGIN CERTIFICATE-----/g,'-----BEGIN CERTIFICATE-----\r')
        .replace(/-----END CERTIFICATE-----/g,'\r-----END CERTIFICATE-----');
    let user = req.body.user;
    let userPassword = req.body.userPassword;
    let hostname = null;
    new Promise((resolve,reject)=>{
        conn.connect({
            serverNode  : req.body.dbServerNode,
            uid         : req.body.authUser,
            pwd         : req.body.authPassword
        }, function(err) {
            if (err) return reject(err);
            resolve();
        });
    })
    .then(data=>{
        new Promise((resolve,reject)=>{
            conn.exec(`SELECT CERTIFICATE_ID FROM CERTIFICATES WHERE CERTIFICATE LIKE '${cert}';`,null,(err,results)=>{
                if(err) return reject(err);
                console.log(results);
                resolve(results);
            })
        });
    })
    .then(data=>{
        console.log(`Adding Certificate '${req.body.comment}'...`);
        return `CREATE CERTIFICATE FROM '${cert}';
        SELECT CERTIFICATE_ID FROM CERTIFICATES WHERE CERTIFICATE LIKE '${cert}';`
        .split('\n').reduce( async (previousPromise, nextStatement) => {
            await previousPromise;
            return new Promise((resolve,reject)=>{
                console.log(`Running:\t${nextStatement}...`);
                conn.exec(nextStatement,null,(err,results)=>{
                    if(err && err.code != 5635) {   // 5635 = Certificate already exists
                        console.log(`Failed on command ${nextStatement} with error: ${JSON.stringify(err)}`);
                        return reject(err);
                    }else{
                        resolve(results);
                    }
                });
            });
        }, Promise.resolve());
    }).then(data=>{
        if(data.length==0){
            throw ("Cannot find the certificate just installed to provide you the ID.");
        }else{
            let certId = data[0].CERTIFICATE_ID;
            if(req.body.pse){
                return new Promise((resolve,reject)=>{
                    conn.exec(`ALTER PSE ${req.body.pse} ADD CERTIFICATE ${certId}`,null,(err,results)=>{
                        if(err) return reject(err);
                        resolve(`Done creating Certificate '${req.body.comment}'.  Your certificate ID is ${data[0].CERTIFICATE_ID} and has been added to PSE ${req.body.pse}`);
                    })
                })
            }else{
                return new Promise((resolve,reject)=>{
                    resolve(`Done creating Certificate '${req.body.comment}'.  Your certificate ID is ${data[0].CERTIFICATE_ID}`);
                });
            }
        }
    })
    .then(msg=>{
        console.log(msg);
        res.status(200);
        res.json({
            success : true,
            message : msg
        });
        res.end();
    })
    .catch((err)=>{
        console.log(`An error occured while trying to creating PSE:\n${JSON.stringify(err)}`);
        res.status(500);
        res.json(err);
        console.log(err);
        res.end();
    });
});

module.exports = router;