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
    let obj = {};
    return new Promise((resolve,reject)=>{
        let form = new formidable.IncomingForm();
        form.parse(req,(err,fields,file)=>{
            var pass = true;
            var missing = [];
            `authUser,authPassword,dbServerNode`.split(',').map(e=>{
                if(!fields[e]) {
                    pass = false;
                    missing.push(e);
                }
            });
            if(!pass){
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
        return new Promise((resolve,reject)=>{
            conn.exec(`SELECT NAME AS KEY, VALUE AS VAL FROM M_SYSTEM_OVERVIEW;`, null, (err,results)=>{
                if (err) return reject(err);
                resolve(results);
            });
        });
    }).then(data=>{
        obj.systemOverview = data;
        utils.log(`System Overview read succeeded.`);
        console.log(data);
        obj.success = true;
        res.status(200);
        res.json(obj);
        res.end();
    }).catch(err=>{
        utils.log(`Overview failed\n\n${JSON.stringify(err)}`);
        res.status(500);
        res.json(err);
        res.end();
    });
});

module.exports = router;