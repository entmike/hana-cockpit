const express = require('express');
const router = express.Router();
const cors = require('cors');
const hana = require('@sap/hana-client');
const formidable = require('formidable');

router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    const utils = require('../utils')({
        spam : true    // Set to true to debug on console
    });
    let conn = hana.createConnection();
    let fields = null;
    return new Promise((resolve,reject)=>{
        let form = new formidable.IncomingForm();
        form.parse(req,(err,fields,file)=>{
            var pass = true;
            var missing = [];
            `authUser,authPassword,role,dbServerNode,user`.split(',').map(e=>{
                if(!fields[e]) {
                    pass = false;
                    missing.push(e);
                }
            })
            if(!pass){
                // Change to reject?
                return reject({
                    success : false,
                    message : `The following required parameters are missing: ${missing.join(',')}`
                });
            }else{
                return resolve({fields,file});
            }            
        });
    }).then(data=>{
        fields = data.fields;
        return new Promise((resolve,reject)=>{
            conn.connect({
                serverNode  : fields.dbServerNode,
                uid         : fields.authUser,
                pwd         : fields.authPassword
            }, function(err) {
                if (err) return(reject(err));
                resolve();
            });
        });
    }).then(()=>{
        return `CALL "GRANT_ACTIVATED_ROLE"('${fields.role}','${fields.user}');`.split('\n').reduce( async (previousPromise, nextLine) => {
            let nextStatement = nextLine.replace(/^[ \t]+/,'');
            console.log(nextStatement);
            await previousPromise;
            return new Promise((resolve,reject)=>{
                utils.log(`Running:\t${nextStatement}...`)
                conn.exec(nextStatement,null,(err,results)=>{
                    if(err) {
                        console.log(`Failed on command ${nextStatement} with error: ${JSON.stringify(err)}`);
                        return reject(err);
                    }else{
                        return resolve(results);
                    }
                });
            });
        }, Promise.resolve())
    }).then(()=>{
        utils.log(`Grant to ${fields.user} succeeded.`);
        res.status(200);
        res.json({
            success : true,
            message : utils.log().join('\n')
        });
        res.end();
    }).catch(err=>{
        utils.log(`Grant failed\n\n${JSON.stringify(err)}`);
        res.status(500);
        res.json(err);
        res.end();
    });
});

module.exports = router;