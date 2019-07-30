const express = require('express');
const formidable = require('formidable');
const router = express.Router();
const cors = require('cors');
const hana = require('@sap/hana-client');

router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    const utils = require('../utils')({
        spam : false    // Set to true to debug on console
    });
    let conn = hana.createConnection();
    let fields = null;
    new Promise((resolve,reject)=>{
        let form = new formidable.IncomingForm();
        form.parse(req,(err,fields,file)=>{
            var pass = true;
            var missing = [];
            `hdiAdmin,hdiAdminPassword,dbServerNode,hdiContainer`.split(',').map(e=>{
                if(!fields[e]) {
                    pass = false;
                    missing.push(e);
                }
            })
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
            utils.log(`Logging in as ${fields.hdiAdmin} to create container '${fields.hdiContainer}'...`);
            conn.connect({
                serverNode  : fields.dbServerNode,
                uid         : fields.hdiAdmin,
                pwd         : fields.hdiAdminPassword
            }, err => {
                if(err) return reject(err); 
                return resolve(conn);
            });
        });
    }).then(conn=>{
        utils.log(`Connected as ${fields.hdiAdmin}.`);
        utils.log(`Dropping HDI Container "${fields.hdiContainer}"...`);
        return new Promise((resolve,reject)=>{
            conn.exec(`CALL _SYS_DI.DROP_CONTAINER('${fields.hdiContainer}', _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);`,null,(err,results)=>{
                if(err) return reject(err);
                return resolve(results);
            });
        });
    }).then(data=>{
        utils.log(`HDI Container "${fields.hdiContainer}" dropped.`);
        let log = [];
        let error = false;
        data.map(row=>{
            if(row.SEVERITY=='ERROR') error = true;
            log.push(row.MESSAGE);
        })
        let errLog = log.join('\n');
        if(error) throw errLog;
        utils.log(log.join('\n'));
        utils.log(`Logging out as ${fields.hdiAdmin}`);
        conn.disconnect();
        Promise.resolve();
    }).then(()=>{
        utils.log(`HDI Container dropped.  Job complete.`);
        res.status(200);
        res.json({
            success : true,
            message : utils.log().join("\n")
        });
        res.end();
    })
    .catch(err=>{
        utils.log('AN ERROR OCCURED.\n\n');
        console.log(err);
        res.status(500);
        res.json(err);
        res.end();
    });
});

module.exports = router;