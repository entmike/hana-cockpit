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
    `authUser,authPassword,externalHost`.split(',').map(e=>{
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
    }).then(data=>{
        console.log(`Getting current hostname...`);
        return new Promise((resolve,reject)=>{
            conn.exec(`SELECT VALUE FROM M_HOST_INFORMATION WHERE KEY='net_hostnames'`,(err,results)=>{
                if(err){
                    reject(err);
                }else{
                    if(results.length==0){
                        reject(`Could not figure out hostname.`);
                    }else{
                        resolve(results[0].VALUE);
                    }
                }
            });
        });
    }).then(data=>{
        hostname = data;
        console.log(`Mapping ${hostname} as ${req.body.externalHost} externally...`);
        return `ALTER SYSTEM ALTER CONFIGURATION ('global.ini', 'system') SET ('public_hostname_resolution', 'use_default_route') = 'name' WITH RECONFIGURE;
        ALTER SYSTEM ALTER CONFIGURATION ('global.ini', 'system') SET ('public_hostname_resolution', 'map_${hostname}') = '${req.body.externalHost}' WITH RECONFIGURE;`
        .split('\n').reduce( async (previousPromise, nextStatement) => {
            await previousPromise;
            return new Promise((resolve,reject)=>{
                console.log(`Running:\t${nextStatement}...`);
                conn.exec(nextStatement,null,(err,results)=>{
                    if(err && err.code != 331) {
                        console.log(`Failed on command ${nextStatement} with error: ${JSON.stringify(err)}`);
                        return reject(err);
                    }else{
                        resolve(results);
                    }
                });
            });
        }, Promise.resolve());
    }).then(data=>{
        console.log(`Done mapping ${hostname} to ${req.body.externalHost}.`);
        res.status(200);
        res.json({
            success : true,
            message : `Done mapping ${hostname} to ${req.body.externalHost}.`
        });
        res.end();
    }).catch((err)=>{
        console.log(`An error occured while trying to map external host:\n${JSON.stringify(err)}`);
        res.status(500);
        res.json(err);
        console.log(err);
        res.end();
    });
});

module.exports = router;